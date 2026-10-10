import json
from io import BytesIO
from unittest import TestCase
from unittest.mock import patch
from urllib.error import URLError

from shooter.dtos import StoreData
from shooter.integrations.cheapshark import (
    CheapSharkClient,
    CheapSharkError,
)


class CheapSharkClientTests(TestCase):
    @patch("shooter.integrations.cheapshark.urlopen")
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

    @patch("shooter.integrations.cheapshark.urlopen")
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

    @patch("shooter.integrations.cheapshark.urlopen")
    def test_reports_connection_failure(self, mock_urlopen):
        mock_urlopen.side_effect = URLError("Connection failed")

        with self.assertRaises(CheapSharkError):
            CheapSharkClient().fetch_stores()