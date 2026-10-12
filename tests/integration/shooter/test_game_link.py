from django.test import TestCase

from shooter.dtos import GameToLink
from shooter.models import ShooterGame
from shooter.repositories.game_link import DjangoGameLinkRepository


class GameLinkRepositoryTests(TestCase):
    def setUp(self):
        self.repository = DjangoGameLinkRepository()
        self.game = ShooterGame.objects.create(
            rawg_id=4200,
            title="Portal 2",
            description="Descripción existente",
        )

    def test_selects_unlinked_games_with_limit_and_cursor(self):
        ShooterGame.objects.create(
            rawg_id=999,
            title="Ya vinculado",
            cheapshark_id="99",
        )
        ShooterGame.objects.create(title="Sin RAWG")
        next_game = ShooterGame.objects.create(
            rawg_id=12020,
            title="Left 4 Dead 2",
        )

        first_batch = self.repository.get_unlinked_games(
            limit=1,
            after_id=0,
        )
        second_batch = self.repository.get_unlinked_games(
            limit=1,
            after_id=self.game.pk,
        )

        self.assertEqual(first_batch, (
            GameToLink(
                local_id=self.game.pk,
                rawg_id=4200,
                steam_app_id="",
            ),
        ))
        self.assertEqual(second_batch, (
            GameToLink(
                local_id=next_game.pk,
                rawg_id=12020,
                steam_app_id="",
            ),
        ))

    def test_saves_link_and_preserves_game_data(self):
        result = self.repository.link(self.game.pk, "620", "36")
        self.game.refresh_from_db()

        self.assertTrue(result)
        self.assertEqual(self.game.steam_app_id, "620")
        self.assertEqual(self.game.cheapshark_id, "36")
        self.assertEqual(self.game.title, "Portal 2")
        self.assertEqual(self.game.description, "Descripción existente")

    def test_preserves_conflicting_existing_links(self):
        for existing_steam_id in ("999", "620"):
            with self.subTest(steam_id=existing_steam_id):
                self.game.steam_app_id = existing_steam_id
                self.game.cheapshark_id = "88"
                self.game.save()

                result = self.repository.link(self.game.pk, "620", "36")
                self.game.refresh_from_db()

                self.assertFalse(result)
                self.assertEqual(
                    self.game.steam_app_id,
                    existing_steam_id,
                )
                self.assertEqual(self.game.cheapshark_id, "88")

    def test_rejects_external_id_used_by_another_game(self):
        ShooterGame.objects.create(
            rawg_id=999,
            title="Otro juego",
            cheapshark_id="36",
        )

        result = self.repository.link(self.game.pk, "620", "36")
        self.game.refresh_from_db()

        self.assertFalse(result)
        self.assertIsNone(self.game.cheapshark_id)