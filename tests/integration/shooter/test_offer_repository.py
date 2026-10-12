from decimal import Decimal

from django.test import TestCase

from shooter.dtos import GameToSyncOffers, OfferData, OfferSyncResult
from shooter.models import GameOffer, ShooterGame, Store
from shooter.repositories.offers import DjangoOfferRepository


class OfferRepositoryTests(TestCase):
    def setUp(self):
        self.repository = DjangoOfferRepository()
        self.game = ShooterGame.objects.create(
            title="Portal 2",
            cheapshark_id="36",
        )
        self.store = Store.objects.create(
            cheapshark_id="1",
            name="Steam",
        )

    def offer(self, external_id="offer-1", price="9.99", store_id="1"):
        return OfferData(
            external_id=external_id,
            store_external_id=store_id,
            price=Decimal(price),
            retail_price=Decimal("19.99"),
        )

    def test_selects_linked_games_with_limit_and_cursor(self):
        ShooterGame.objects.create(title="Sin vincular")
        ShooterGame.objects.create(title="ID vacío", cheapshark_id="")
        next_game = ShooterGame.objects.create(
            title="Left 4 Dead 2",
            cheapshark_id="99",
        )

        self.assertEqual(
            self.repository.get_linked_games(limit=1, after_id=0),
            (GameToSyncOffers(self.game.pk, "36"),),
        )
        self.assertEqual(
            self.repository.get_linked_games(
                limit=1,
                after_id=self.game.pk,
            ),
            (GameToSyncOffers(next_game.pk, "99"),),
        )

    def test_creates_offer_with_correct_game_store_and_price(self):
        result = self.repository.sync_offers(
            self.game.pk,
            (self.offer(),),
        )
        saved = GameOffer.objects.get(cheapshark_deal_id="offer-1")

        self.assertEqual(result, OfferSyncResult(1, 0, 0))
        self.assertEqual(saved.game_id, self.game.pk)
        self.assertEqual(saved.store_id, self.store.pk)
        self.assertEqual(saved.price, Decimal("9.99"))
        self.assertEqual(saved.retail_price, Decimal("19.99"))
        self.assertEqual(saved.currency, "USD")
        self.assertTrue(saved.is_active)
        self.assertIsNotNone(saved.last_synced_at)

    def test_updates_and_reactivates_existing_offer(self):
        self.repository.sync_offers(self.game.pk, (self.offer(),))
        saved = GameOffer.objects.get(cheapshark_deal_id="offer-1")
        saved.is_active = False
        saved.save(update_fields=["is_active"])

        result = self.repository.sync_offers(
            self.game.pk,
            (self.offer(price="0.00"),),
        )
        saved.refresh_from_db()

        self.assertEqual(result, OfferSyncResult(0, 1, 0))
        self.assertEqual(saved.price, Decimal("0.00"))
        self.assertTrue(saved.is_active)
        self.assertEqual(GameOffer.objects.count(), 1)

    def test_deactivates_missing_offers_and_preserves_last_seen(self):
        self.repository.sync_offers(
            self.game.pk,
            (self.offer("keep"), self.offer("missing")),
        )
        missing = GameOffer.objects.get(cheapshark_deal_id="missing")
        last_seen = missing.last_synced_at

        result = self.repository.sync_offers(
            self.game.pk,
            (self.offer("keep"),),
        )
        missing.refresh_from_db()

        self.assertEqual(result, OfferSyncResult(0, 1, 1))
        self.assertFalse(missing.is_active)
        self.assertEqual(missing.last_synced_at, last_seen)
        self.assertTrue(
            GameOffer.objects.get(cheapshark_deal_id="keep").is_active
        )

    def test_empty_snapshot_deactivates_all_offers_only_once(self):
        self.repository.sync_offers(self.game.pk, (self.offer(),))

        first = self.repository.sync_offers(self.game.pk, ())
        second = self.repository.sync_offers(self.game.pk, ())

        self.assertEqual(first, OfferSyncResult(0, 0, 1))
        self.assertEqual(second, OfferSyncResult(0, 0, 0))
        self.assertEqual(GameOffer.objects.count(), 1)

    def test_conflict_rolls_back_updates_and_creations(self):
        self.repository.sync_offers(self.game.pk, (self.offer(),))
        existing = GameOffer.objects.get(cheapshark_deal_id="offer-1")
        last_seen = existing.last_synced_at

        other_game = ShooterGame.objects.create(
            title="Otro juego",
            cheapshark_id="88",
        )
        self.repository.sync_offers(
            other_game.pk,
            (self.offer("conflict"),),
        )

        with self.assertRaises(ValueError):
            self.repository.sync_offers(
                self.game.pk,
                (
                    self.offer(price="1.00"),
                    self.offer("new"),
                    self.offer("conflict"),
                ),
            )

        existing.refresh_from_db()
        self.assertEqual(existing.price, Decimal("9.99"))
        self.assertEqual(existing.last_synced_at, last_seen)
        self.assertTrue(existing.is_active)
        self.assertFalse(
            GameOffer.objects.filter(cheapshark_deal_id="new").exists()
        )
        self.assertEqual(
            GameOffer.objects.get(
                cheapshark_deal_id="conflict",
            ).game_id,
            other_game.pk,
        )

    def test_rejects_unknown_store_without_changing_existing_offers(self):
        self.repository.sync_offers(self.game.pk, (self.offer(),))

        with self.assertRaises(ValueError):
            self.repository.sync_offers(
                self.game.pk,
                (self.offer("unknown", store_id="999"),),
            )

        self.assertEqual(GameOffer.objects.count(), 1)
        self.assertTrue(GameOffer.objects.get().is_active)