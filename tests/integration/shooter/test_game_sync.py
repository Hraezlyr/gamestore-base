from django.test import TestCase

from shooter.dtos import GameData, ScreenshotData
from shooter.models import ShooterGame
from shooter.services.game_sync import sync_games


class GameSyncTests(TestCase):
    def test_gallery_sync_updates_reorders_and_removes_without_duplicates(self):
        first = ScreenshotData(10, "https://example.com/first.jpg")
        second = ScreenshotData(20, "https://example.com/second.jpg")
        sync_games([GameData(4200, "Portal 2", "", (first, second))])
        game = ShooterGame.objects.get(rawg_id=4200)
        retained_id = game.screenshots.get(rawg_id=20).pk
        replacement = ScreenshotData(20, "https://example.com/updated.jpg")
        for _ in range(2):
            sync_games([GameData(4200, "Portal 2", "", (replacement,))])
        self.assertEqual(list(game.screenshots.values_list("pk", "image_url", "position")), [
            (retained_id, replacement.image_url, 0),
        ])

    def test_missing_gallery_preserves_images_and_empty_snapshot_clears_them(self):
        screenshot = ScreenshotData(10, "https://example.com/first.jpg")
        sync_games([GameData(4200, "Portal 2", "", (screenshot,))])
        game = ShooterGame.objects.get(rawg_id=4200)
        sync_games([GameData(4200, "Portal 2", "")])
        self.assertEqual(game.screenshots.count(), 1)
        sync_games([GameData(4200, "Portal 2", "", ())])
        self.assertFalse(game.screenshots.exists())

    def test_creates_games(self):
        result = sync_games([
            GameData(
                external_id=4200,
                title="Portal 2",
                image_url="https://example.com/portal2.jpg",
            ),
            GameData(
                external_id=12020,
                title="Left 4 Dead 2",
                image_url="",
            ),
        ])

        self.assertEqual(result.created, 2)
        self.assertEqual(result.updated, 0)
        self.assertEqual(ShooterGame.objects.count(), 2)

        game = ShooterGame.objects.get(rawg_id=4200)
        self.assertEqual(game.title, "Portal 2")
        self.assertEqual(
            game.image_url,
            "https://example.com/portal2.jpg",
        )

    def test_updates_without_duplicates_and_preserves_other_data(self):
        game = ShooterGame.objects.create(
            rawg_id=4200,
            title="Título anterior",
            description="Descripción existente",
            cheapshark_id="123",
            steam_app_id="620",
        )

        games = [
            GameData(
                external_id=4200,
                title="Portal 2",
                image_url="https://example.com/portal2.jpg",
            ),
        ]

        first_result = sync_games(games)
        second_result = sync_games(games)
        game.refresh_from_db()

        self.assertEqual(first_result.created, 0)
        self.assertEqual(first_result.updated, 1)
        self.assertEqual(second_result.created, 0)
        self.assertEqual(second_result.updated, 1)
        self.assertEqual(ShooterGame.objects.count(), 1)

        self.assertEqual(game.title, "Portal 2")
        self.assertEqual(
            game.image_url,
            "https://example.com/portal2.jpg",
        )
        self.assertEqual(game.description, "Descripción existente")
        self.assertEqual(game.cheapshark_id, "123")
        self.assertEqual(game.steam_app_id, "620")
