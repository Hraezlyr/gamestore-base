import json
from decimal import Decimal
from io import BytesIO
from unittest import TestCase
from unittest.mock import patch
from urllib.error import URLError

from modules.shooter.domain.dtos import StoreData, GameMatchData, OfferData
from modules.shooter.integrations.cheapshark import (
    CheapSharkClient,
    CheapSharkError,
)


class CheapSharkClientTests(TestCase):
    def test_resolves_store_icon_against_the_provider_host(self):
        store = CheapSharkClient._parse_store({
            "storeID": "1", "storeName": "Steam", "isActive": 1,
            "images": {"icon": "/img/stores/icons/0.png"},
        })
        self.assertEqual(store.icon_url, "https://www.cheapshark.com/img/stores/icons/0.png")

    def test_rejects_unexpected_store_icon_paths(self):
        for images in ([], {"icon": None}, {"icon": "https://example.com/icon.png"},
                       {"icon": "//example.com/icon.png"}):
            with self.subTest(images=images), self.assertRaises(CheapSharkError):
                CheapSharkClient._parse_store_icon(images)

    @patch("modules.shooter.integrations.cheapshark.urlopen")
    def test_returns_stores_with_boolean_status(self, mock_urlopen):
        payload = [
            {"storeID": "1", "storeName": "Steam", "isActive": 1},
            {"storeID": "4", "storeName": "Amazon", "isActive": "0"},
        ]
        mock_urlopen.return_value = BytesIO(
            json.dumps(payload).encode("utf-8")
        )

        stores = CheapSharkClient().fetch_stores()

        self.assertEqual(stores, [
            StoreData(external_id="1", name="Steam", is_active=True),
            StoreData(external_id="4", name="Amazon", is_active=False),
        ])

    @patch("modules.shooter.integrations.cheapshark.urlopen")
    def test_rejects_invalid_responses(self, mock_urlopen):
        invalid_payloads = [
            {"message": "unexpected response"},
            [None],
            [{"storeID": "1", "isActive": 1}],
            [{"storeID": "1", "storeName": "Steam", "isActive": 2}],
        ]

        for payload in invalid_payloads:
            with self.subTest(payload=payload):
                mock_urlopen.return_value = BytesIO(
                    json.dumps(payload).encode("utf-8")
                )

                with self.assertRaises(CheapSharkError):
                    CheapSharkClient().fetch_stores()

    @patch("modules.shooter.integrations.cheapshark.urlopen")
    def test_reports_connection_failure(self, mock_urlopen):
        mock_urlopen.side_effect = URLError("Connection failed")

        with self.assertRaises(CheapSharkError):
            CheapSharkClient().fetch_stores()

    @patch("modules.shooter.integrations.cheapshark.CheapSharkClient._get_json")
    def test_returns_game_candidates_for_steam_id(self, mock_get_json):
        mock_get_json.return_value = [
            {
                "gameID": "36",
                "external": "Portal 2",
                "steamAppID": "620",
            },
            {
                "gameID": "99",
                "external": "Otro candidato",
                "steamAppID": "620",
            },
        ]

        matches = CheapSharkClient().fetch_games_by_steam_app_id("620")

        self.assertEqual(matches, (
            GameMatchData(
                external_id="36",
                steam_app_id="620",
                title="Portal 2",
            ),
            GameMatchData(
                external_id="99",
                steam_app_id="620",
                title="Otro candidato",
            ),
        ))

    @patch("modules.shooter.integrations.cheapshark.CheapSharkClient._get_json")
    def test_returns_no_candidates_when_game_is_not_found(
        self, mock_get_json
    ):
        mock_get_json.return_value = []

        matches = CheapSharkClient().fetch_games_by_steam_app_id("620")

        self.assertEqual(matches, ())

    @patch("modules.shooter.integrations.cheapshark.CheapSharkClient._get_json")
    def test_rejects_candidate_with_different_steam_id(
        self, mock_get_json
    ):
        mock_get_json.return_value = [
            {
                "gameID": "36",
                "external": "Portal 2",
                "steamAppID": "999",
            },
        ]

        with self.assertRaises(CheapSharkError):
            CheapSharkClient().fetch_games_by_steam_app_id("620")

    @patch("modules.shooter.integrations.cheapshark.CheapSharkClient._get_json")
    def test_converts_offer_prices_including_free_games(self, mock_get_json):
        mock_get_json.return_value = {
            "deals": [
                {
                    "dealID": "offer-1",
                    "storeID": "1",
                    "price": "9.99",
                    "retailPrice": "19.99",
                },
                {
                    "dealID": "offer-2",
                    "storeID": "3",
                    "price": "0.00",
                    "retailPrice": "9.99",
                },
            ],
        }

        offers = CheapSharkClient().fetch_game_offers("36")

        self.assertEqual(offers, (
            OfferData(
                external_id="offer-1",
                store_external_id="1",
                price=Decimal("9.99"),
                retail_price=Decimal("19.99"),
            ),
            OfferData(
                external_id="offer-2",
                store_external_id="3",
                price=Decimal("0.00"),
                retail_price=Decimal("9.99"),
            ),
        ))

    @patch("modules.shooter.integrations.cheapshark.CheapSharkClient._get_json")
    def test_rejects_invalid_offer_prices(self, mock_get_json):
        invalid_prices = (
            "-1", "NaN", "Infinity", "9.999",
            "100000000.00", "not-a-price", 9.99, None,
        )

        for field in ("price", "retailPrice"):
            for value in invalid_prices:
                with self.subTest(field=field, value=value):
                    deal = {
                        "dealID": "offer-1",
                        "storeID": "1",
                        "price": "9.99",
                        "retailPrice": "19.99",
                    }
                    deal[field] = value
                    mock_get_json.return_value = {"deals": [deal]}

                    with self.assertRaises(CheapSharkError):
                        CheapSharkClient().fetch_game_offers("36")

    @patch("modules.shooter.integrations.cheapshark.CheapSharkClient._get_json")
    def test_accepts_empty_offer_list(self, mock_get_json):
        mock_get_json.return_value = {"deals": []}

        offers = CheapSharkClient().fetch_game_offers("36")

        self.assertEqual(offers, ())

    @patch("modules.shooter.integrations.cheapshark.CheapSharkClient._get_json")
    def test_rejects_incomplete_offer_response(self, mock_get_json):
        for payload in ({}, {"deals": None}, {"deals": [None]}):
            with self.subTest(payload=payload):
                mock_get_json.return_value = payload

                with self.assertRaises(CheapSharkError):
                    CheapSharkClient().fetch_game_offers("36")

    @patch("modules.shooter.integrations.cheapshark.CheapSharkClient._get_json")
    def test_rejects_duplicate_offer_ids(self, mock_get_json):
        deal = {
            "dealID": "offer-1",
            "storeID": "1",
            "price": "9.99",
            "retailPrice": "19.99",
        }
        mock_get_json.return_value = {"deals": [deal, deal.copy()]}

        with self.assertRaises(CheapSharkError):
            CheapSharkClient().fetch_game_offers("36")
