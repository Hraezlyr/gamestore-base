from unittest import TestCase
from urllib.parse import parse_qs, urlsplit

from modules.shooter.api.links import cheapshark_deal_url


class OfferLinkTests(TestCase):
    def test_preserves_encoded_deal_id_without_double_encoding(self):
        url = cheapshark_deal_url("abc%2Bdef%2Fghi%3D")
        self.assertEqual(url, "https://www.cheapshark.com/redirect?dealID=abc%2Bdef%2Fghi%3D")
        self.assertEqual(parse_qs(urlsplit(url).query)["dealID"], ["abc+def/ghi="])

    def test_encodes_raw_ids_without_injecting_query_parameters(self):
        url = cheapshark_deal_url("abc+def=&other=value")
        self.assertEqual(parse_qs(urlsplit(url).query), {"dealID": ["abc+def=&other=value"]})
