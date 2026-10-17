import json
from io import BytesIO
from unittest import TestCase
from unittest.mock import patch
from urllib.error import HTTPError

from shooter.dtos import GameData, ScreenshotData
from shooter.integrations.rawg import RawgClient, RawgError


class RawgClientTests(TestCase):
    def test_imports_screenshots_in_order_without_the_cover_sentinel(self):
        game = RawgClient._parse_game({
            "id": 4200, "name": "Portal 2", "background_image": "https://media.rawg.io/cover.jpg",
            "short_screenshots": [
                {"id": -1, "image": "https://media.rawg.io/cover.jpg"},
                {"id": 10, "image": "https://media.rawg.io/first.jpg"},
                {"id": 20, "image": "https://media.rawg.io/second.jpg"},
            ],
        })
        self.assertEqual(game.screenshots, (
            ScreenshotData(10, "https://media.rawg.io/first.jpg"),
            ScreenshotData(20, "https://media.rawg.io/second.jpg"),
        ))

    def test_distinguishes_missing_screenshots_from_an_empty_snapshot(self):
        self.assertIsNone(RawgClient._parse_screenshots(None))
        self.assertEqual(RawgClient._parse_screenshots([]), ())

    def test_rejects_malformed_screenshots(self):
        valid = {"id": 10, "image": "https://media.rawg.io/first.jpg"}
        for items in ({}, [None], [{"id": True, "image": valid["image"]}],
                      [{"id": 1, "image": "javascript:alert(1)"}], [valid, valid]):
            with self.subTest(items=items), self.assertRaises(RawgError):
                RawgClient._parse_screenshots(items)

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

    @patch("shooter.integrations.rawg.RawgClient._get_json")
    def test_identifies_only_steam_app_links(self, mock_get_json):
        cases = [
            ("http://store.steampowered.com/app/620/", "620"),
            ("https://store.steampowered.com/app/620/Portal_2/", "620"),
            ("https://store.steampowered.com/app/620?example=1", "620"),
            ("https://store.steampowered.com/sub/620/", None),
            ("https://store.steampowered.com/bundle/620/", None),
            ("https://example.com/app/620/", None),
            ("https://store.steampowered.com.example.com/app/620/", None),
        ]

        for url, expected in cases:
            with self.subTest(url=url):
                mock_get_json.return_value = {
                    "results": [{"url": url}],
                    "next": None,
                }

                result = RawgClient(
                    api_key="test-key"
                ).fetch_steam_app_id(4200)

                self.assertEqual(result, expected)

    @patch("shooter.integrations.rawg.RawgClient._get_json")
    def test_checks_all_pages_and_deduplicates_steam_ids(
        self, mock_get_json
    ):
        mock_get_json.side_effect = [
            {
                "results": [
                    {"url": "http://store.steampowered.com/app/620/"},
                ],
                "next": "https://api.rawg.io/api/games/4200/stores?page=2",
            },
            {
                "results": [
                    {"url": "https://store.steampowered.com/app/620/"},
                ],
                "next": None,
            },
        ]

        result = RawgClient(api_key="test-key").fetch_steam_app_id(4200)

        self.assertEqual(result, "620")
        self.assertEqual(mock_get_json.call_count, 2)

    @patch("shooter.integrations.rawg.RawgClient._get_json")
    def test_does_not_choose_between_different_steam_ids(
        self, mock_get_json
    ):
        mock_get_json.return_value = {
            "results": [
                {"url": "https://store.steampowered.com/app/620/"},
                {"url": "https://store.steampowered.com/app/999/"},
            ],
            "next": None,
        }

        result = RawgClient(api_key="test-key").fetch_steam_app_id(4200)

        self.assertIsNone(result)
