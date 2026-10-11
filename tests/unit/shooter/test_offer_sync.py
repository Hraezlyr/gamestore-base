from decimal import Decimal
from unittest import TestCase
from unittest.mock import create_autospec, call

from shooter.dtos import GameToSyncOffers, OfferData, OfferSyncResult
from shooter.ports import OfferProvider, OfferRepository
from shooter.services.offer_sync import (
    sync_catalog_offers,
    sync_game_offers,
)


class OfferSyncTests(TestCase):
    def setUp(self):
        self.provider = create_autospec(
            OfferProvider,
            instance=True,
            spec_set=True,
        )
        self.repository = create_autospec(
            OfferRepository,
            instance=True,
            spec_set=True,
        )
        self.game = GameToSyncOffers(
            local_id=7,
            cheapshark_id="36",
        )

    def test_fetches_external_id_and_saves_with_local_id(self):
        offers = (
            OfferData(
                external_id="offer-1",
                store_external_id="1",
                price=Decimal("9.99"),
                retail_price=Decimal("19.99"),
            ),
        )
        expected = OfferSyncResult(1, 0, 0)
        self.provider.fetch_game_offers.return_value = offers
        self.repository.sync_offers.return_value = expected

        result = sync_game_offers(
            self.game,
            self.provider,
            self.repository,
        )

        self.provider.fetch_game_offers.assert_called_once_with("36")
        self.repository.sync_offers.assert_called_once_with(
            game_pk=7,
            offers=offers,
        )
        self.assertEqual(result, expected)

    def test_provider_failure_does_not_write(self):
        self.provider.fetch_game_offers.side_effect = RuntimeError(
            "Proveedor no disponible"
        )

        with self.assertRaisesRegex(
            RuntimeError,
            "Proveedor no disponible",
        ):
            sync_game_offers(
                self.game,
                self.provider,
                self.repository,
            )

        self.repository.sync_offers.assert_not_called()

    def test_valid_empty_response_reaches_repository(self):
        self.provider.fetch_game_offers.return_value = ()
        self.repository.sync_offers.return_value = OfferSyncResult(
            0, 0, 2
        )

        result = sync_game_offers(
            self.game,
            self.provider,
            self.repository,
        )

        self.repository.sync_offers.assert_called_once_with(
            game_pk=7,
            offers=(),
        )
        self.assertEqual(result.deactivated, 2)

    def test_batch_reports_totals_and_last_processed_id(self):
        self.repository.get_linked_games.return_value = (
            GameToSyncOffers(7, "36"),
            GameToSyncOffers(12, "99"),
        )
        self.provider.fetch_game_offers.return_value = ()
        self.repository.sync_offers.side_effect = (
            OfferSyncResult(2, 1, 0),
            OfferSyncResult(0, 3, 1),
        )

        result = sync_catalog_offers(
            provider=self.provider,
            repository=self.repository,
            limit=2,
            after_id=5,
        )

        self.repository.get_linked_games.assert_called_once_with(
            limit=2,
            after_id=5,
        )
        self.assertEqual(
            self.provider.fetch_game_offers.call_args_list,
            [call("36"), call("99")],
        )
        self.assertEqual(
            self.repository.sync_offers.call_args_list,
            [
                call(game_pk=7, offers=()),
                call(game_pk=12, offers=()),
            ],
        )
        self.assertEqual(result.created, 2)
        self.assertEqual(result.updated, 4)
        self.assertEqual(result.deactivated, 1)
        self.assertEqual(result.last_id, 12)
        self.assertEqual(
            tuple(outcome.local_id for outcome in result.outcomes),
            (7, 12),
        )

    def test_empty_batch_does_not_fetch_or_write(self):
        self.repository.get_linked_games.return_value = ()

        result = sync_catalog_offers(
            provider=self.provider,
            repository=self.repository,
        )

        self.assertEqual(result.outcomes, ())
        self.assertEqual(result.created, 0)
        self.assertEqual(result.updated, 0)
        self.assertEqual(result.deactivated, 0)
        self.assertIsNone(result.last_id)
        self.provider.fetch_game_offers.assert_not_called()
        self.repository.sync_offers.assert_not_called()

    def test_invalid_batch_options_do_not_query_repository(self):
        for limit, after_id in ((0, 0), (-1, 0), (1, -1)):
            with self.subTest(limit=limit, after_id=after_id):
                with self.assertRaises(ValueError):
                    sync_catalog_offers(
                        provider=self.provider,
                        repository=self.repository,
                        limit=limit,
                        after_id=after_id,
                    )

        self.repository.get_linked_games.assert_not_called()

    def test_provider_failure_stops_batch_before_next_game(self):
        self.repository.get_linked_games.return_value = (
            GameToSyncOffers(7, "36"),
            GameToSyncOffers(12, "99"),
            GameToSyncOffers(15, "100"),
        )
        self.provider.fetch_game_offers.side_effect = (
            (),
            RuntimeError("Proveedor no disponible"),
        )
        self.repository.sync_offers.return_value = OfferSyncResult(
            0, 0, 1
        )

        with self.assertRaises(RuntimeError):
            sync_catalog_offers(
                provider=self.provider,
                repository=self.repository,
            )

        self.assertEqual(
            self.provider.fetch_game_offers.call_args_list,
            [call("36"), call("99")],
        )
        self.repository.sync_offers.assert_called_once_with(
            game_pk=7,
            offers=(),
        )