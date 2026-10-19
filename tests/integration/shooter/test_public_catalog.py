from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from modules.shooter.models import GameOffer, ShooterGame, Store
from modules.shooter.selectors import public_catalog


class PublicCatalogTests(TestCase):
    def setUp(self):
        self.game = ShooterGame.objects.create(title="Portal 2")
        self.steam = Store.objects.create(
            cheapshark_id="1",
            name="Steam",
        )
        self.other_store = Store.objects.create(
            cheapshark_id="3",
            name="Otra tienda",
        )

    def add_offer(
        self,
        deal_id,
        price="9.99",
        store=None,
        is_active=True,
        currency="USD",
    ):
        return GameOffer.objects.create(
            game=self.game,
            store=store if store is not None else self.steam,
            cheapshark_deal_id=deal_id,
            price=Decimal(price),
            retail_price=Decimal("19.99"),
            currency=currency,
            is_active=is_active,
            last_synced_at=timezone.now(),
        )

    def test_excludes_game_without_offers(self):
        self.assertFalse(public_catalog().exists())

    def test_includes_free_game(self):
        self.add_offer("free", price="0.00")

        game = public_catalog().get(pk=self.game.pk)

        self.assertEqual(game.lowest_price, Decimal("0.00"))

    def test_excludes_game_with_only_inactive_offers(self):
        self.add_offer("inactive", is_active=False)

        self.assertFalse(public_catalog().exists())

    def test_excludes_game_with_only_inactive_store(self):
        self.steam.is_active = False
        self.steam.save(update_fields=["is_active"])
        self.add_offer("inactive-store")

        self.assertFalse(public_catalog().exists())

    def test_excludes_game_without_usd_offers(self):
        self.add_offer("eur", currency="EUR")

        self.assertFalse(public_catalog().exists())

    def test_uses_lowest_available_usd_price_without_duplicates(self):
        self.other_store.is_active = False
        self.other_store.save(update_fields=["is_active"])

        self.add_offer("regular", price="9.99")
        self.add_offer("cheapest", price="7.99")
        self.add_offer("inactive", price="1.00", is_active=False)
        self.add_offer(
            "inactive-store",
            price="2.00",
            store=self.other_store,
        )
        self.add_offer("eur", price="3.00", currency="EUR")

        games = list(public_catalog())

        self.assertEqual(len(games), 1)
        self.assertEqual(games[0].pk, self.game.pk)
        self.assertEqual(games[0].lowest_price, Decimal("7.99"))