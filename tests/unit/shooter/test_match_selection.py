from unittest import TestCase

from shooter.dtos import GameMatchData, LinkStatus
from shooter.services.catalog_link import select_unique_match


class MatchSelectionTests(TestCase):
    def setUp(self):
        self.match = GameMatchData(
            external_id="36",
            steam_app_id="620",
            title="Portal 2",
        )

    def test_accepts_unique_matching_candidate(self):
        result = select_unique_match([self.match], "620")

        self.assertEqual(result, self.match)

    def test_reports_missing_candidate(self):
        result = select_unique_match([], "620")

        self.assertEqual(result, LinkStatus.NO_MATCH)

    def test_reports_ambiguous_candidates(self):
        other_match = GameMatchData(
            external_id="99",
            steam_app_id="620",
            title="Otro candidato",
        )

        result = select_unique_match(
            [self.match, other_match],
            "620",
        )

        self.assertEqual(result, LinkStatus.AMBIGUOUS)

    def test_reports_different_steam_id(self):
        result = select_unique_match([self.match], "999")

        self.assertEqual(result, LinkStatus.STEAM_ID_MISMATCH)