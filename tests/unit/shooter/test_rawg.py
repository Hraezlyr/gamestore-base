import json
from io import BytesIO
from unittest import TestCase
from unittest.mock import patch
from urllib.error import HTTPError

from shooter.dtos import GameData
from shooter.integrations.rawg import RawgClient, RawgError


class RawgClientTests(TestCase):
    @patch("shooter.integrations.rawg.urlopen")
    def test_converts_games_and_reports_next_page(self, mock_urlopen):
        for next_url in (None, "https://api.rawg.io/api/games?page=2"):
            with self.subTest(next_url=next_url):
                payload = {
                    "results": [
                        {
                            "id": 4200,
                            "name": "Portal 2",
                            "background_image": None,
                        },
                    ],
                    "next": next_url,
                }
                mock_urlopen.return_value = BytesIO(
                    json.dumps(payload).encode("utf-8")
                )

                page = RawgClient(
                    api_key="test-key"
                ).fetch_shooter_games()

                self.assertEqual(page.games, (
                    GameData(
                        external_id=4200,
                        title="Portal 2",
                        image_url="",
                    ),
                ))
                self.assertEqual(page.has_next, next_url is not None)

    @patch("shooter.integrations.rawg.urlopen")
    def test_rejects_invalid_responses(self, mock_urlopen):
        invalid_payloads = [
            [],
            {"results": None, "next": None},
            {"results": [], "next": 123},
            {
                "results": [{"id": 4200, "name": ""}],
                "next": None,
            },
        ]

        for payload in invalid_payloads:
            with self.subTest(payload=payload):
                mock_urlopen.return_value = BytesIO(
                    json.dumps(payload).encode("utf-8")
                )

                with self.assertRaises(RawgError):
                    RawgClient(api_key="test-key").fetch_shooter_games()

    @patch("shooter.integrations.rawg.urlopen")
    def test_http_error_does_not_expose_key(self, mock_urlopen):
        mock_urlopen.side_effect = HTTPError(
            url="https://api.rawg.io/api/games?key=test-secret",
            code=403,
            msg="Forbidden",
            hdrs=None,
            fp=None,
        )

        with self.assertRaises(RawgError) as context:
            RawgClient(api_key="test-secret").fetch_shooter_games()

        self.assertIn("403", str(context.exception))
        self.assertNotIn("test-secret", str(context.exception))
        self.assertTrue(context.exception.__suppress_context__)

    def test_requires_api_key(self):
        with self.assertRaises(RawgError):
            RawgClient(api_key="")