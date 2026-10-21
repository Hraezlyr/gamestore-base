from io import StringIO
from unittest.mock import call, patch

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import SimpleTestCase, override_settings

from modules.shooter.domain.dtos import GamePage, GameSyncResult


COMMAND_MODULE = "modules.shooter.management.commands.sync_shooter_games"


@override_settings(RAWG_API_KEY="test-key")
class SyncGamesCommandTests(SimpleTestCase):
    @patch(f"{COMMAND_MODULE}.sync_games")
    @patch(f"{COMMAND_MODULE}.RawgClient")
    def test_respects_page_limit(self, mock_client, mock_sync):
        client = mock_client.return_value
        client.fetch_shooter_games.return_value = GamePage(
            games=(),
            has_next=True,
        )
        mock_sync.return_value = GameSyncResult(created=0, updated=0)

        call_command(
            "sync_shooter_games",
            max_pages=2,
            stdout=StringIO(),
        )

        self.assertEqual(
            client.fetch_shooter_games.call_args_list,
            [
                call(page=1, page_size=20),
                call(page=2, page_size=20),
            ],
        )
        self.assertEqual(mock_sync.call_count, 2)

    @patch(f"{COMMAND_MODULE}.sync_games")
    @patch(f"{COMMAND_MODULE}.RawgClient")
    def test_stops_when_no_next_page(self, mock_client, mock_sync):
        client = mock_client.return_value
        client.fetch_shooter_games.return_value = GamePage(
            games=(),
            has_next=False,
        )
        mock_sync.return_value = GameSyncResult(created=0, updated=0)

        call_command(
            "sync_shooter_games",
            max_pages=5,
            stdout=StringIO(),
        )

        client.fetch_shooter_games.assert_called_once_with(
            page=1,
            page_size=20,
        )
        mock_sync.assert_called_once_with(())

    @patch(f"{COMMAND_MODULE}.RawgClient")
    def test_rejects_invalid_page_limit(self, mock_client):
        with self.assertRaises(CommandError):
            call_command(
                "sync_shooter_games",
                max_pages=0,
                stdout=StringIO(),
            )

        mock_client.assert_not_called()