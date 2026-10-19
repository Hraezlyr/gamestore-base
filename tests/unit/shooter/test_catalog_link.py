from unittest import TestCase
from unittest.mock import create_autospec

from modules.shooter.domain.dtos import GameMatchData, GameToLink, LinkStatus
from modules.shooter.domain.ports import (
    GameLinkRepository,
    GameMatchProvider,
    SteamIdProvider,
)
from modules.shooter.services.catalog_link import link_catalog, link_one_game


class CatalogLinkTests(TestCase):
    def setUp(self):
        self.repository = create_autospec(
            GameLinkRepository,
            instance=True,
            spec_set=True,
        )
        self.steam_provider = create_autospec(
            SteamIdProvider,
            instance=True,
            spec_set=True,
        )
        self.match_provider = create_autospec(
            GameMatchProvider,
            instance=True,
            spec_set=True,
        )
        self.dependencies = {
            "repository": self.repository,
            "steam_provider": self.steam_provider,
            "match_provider": self.match_provider,
        }
        self.match = GameMatchData(
            external_id="36",
            steam_app_id="620",
            title="Portal 2",
        )
        self.repository.link.return_value = True
        self.steam_provider.fetch_steam_app_id.return_value = "620"
        self.match_provider.fetch_games_by_steam_app_id.return_value = (
            self.match,
        )

    def test_reuses_stored_steam_id_and_saves_unique_match(self):
        game = GameToLink(local_id=1, rawg_id=4200, steam_app_id="620")

        outcome = link_one_game(game=game, **self.dependencies)

        self.assertEqual(outcome.local_id, 1)
        self.assertEqual(outcome.status, LinkStatus.LINKED)
        self.steam_provider.fetch_steam_app_id.assert_not_called()
        self.repository.link.assert_called_once_with(
            game_pk=1,
            steam_app_id="620",
            cheapshark_id="36",
        )

    def test_missing_steam_id_does_not_search_or_write(self):
        game = GameToLink(local_id=1, rawg_id=4200, steam_app_id="")
        self.steam_provider.fetch_steam_app_id.return_value = None

        outcome = link_one_game(game=game, **self.dependencies)

        self.assertEqual(outcome.status, LinkStatus.NO_STEAM_ID)
        self.match_provider.fetch_games_by_steam_app_id.assert_not_called()
        self.repository.link.assert_not_called()

    def test_ambiguous_candidates_do_not_write(self):
        game = GameToLink(local_id=1, rawg_id=4200, steam_app_id="620")
        self.match_provider.fetch_games_by_steam_app_id.return_value = (
            self.match,
            GameMatchData("99", "620", "Otro candidato"),
        )

        outcome = link_one_game(game=game, **self.dependencies)

        self.assertEqual(outcome.status, LinkStatus.AMBIGUOUS)
        self.repository.link.assert_not_called()

    def test_batch_reports_results_and_last_processed_id(self):
        self.repository.get_unlinked_games.return_value = (
            GameToLink(1, 4200, ""),
            GameToLink(2, 4291, ""),
            GameToLink(3, 12020, ""),
        )
        self.steam_provider.fetch_steam_app_id.side_effect = (
            "620",
            None,
            "550",
        )
        self.match_provider.fetch_games_by_steam_app_id.side_effect = (
            (self.match,),
            (),
        )

        result = link_catalog(
            limit=3,
            after_id=0,
            **self.dependencies,
        )

        self.assertEqual(result.linked, 1)
        self.assertEqual(result.skipped, 2)
        self.assertEqual(result.last_id, 3)
        self.assertEqual(
            tuple(outcome.status for outcome in result.outcomes),
            (
                LinkStatus.LINKED,
                LinkStatus.NO_STEAM_ID,
                LinkStatus.NO_MATCH,
            ),
        )
        self.repository.link.assert_called_once()

    def test_invalid_options_do_not_query_repository(self):
        for limit, after_id in ((0, 0), (1, -1)):
            with self.subTest(limit=limit, after_id=after_id):
                with self.assertRaises(ValueError):
                    link_catalog(
                        limit=limit,
                        after_id=after_id,
                        **self.dependencies,
                    )

        self.repository.get_unlinked_games.assert_not_called()