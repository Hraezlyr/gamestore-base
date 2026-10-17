from decimal import Decimal

from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from modules.shooter.models import GameOffer, GameScreenshot, ShooterGame, Store


class CatalogApiTests(APITestCase):
    def test_detail_exposes_ordered_gallery_and_store_icons_without_extra_row_queries(self):
        game = self.create_available_game("Portal 2")
        self.store.icon_url = "https://www.cheapshark.com/img/stores/icons/0.png"
        self.store.save(update_fields=["icon_url"])
        second = GameScreenshot.objects.create(game=game, rawg_id=20, image_url="https://example.com/second.jpg", position=1)
        first = GameScreenshot.objects.create(game=game, rawg_id=10, image_url="https://example.com/first.jpg", position=0)
        with self.assertNumQueries(3):
            response = self.client.get(reverse("shooter:game-detail", kwargs={"pk": game.pk}))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["screenshots"], [
            {"id": first.pk, "image_url": first.image_url},
            {"id": second.pk, "image_url": second.image_url},
        ])
        self.assertEqual(response.data["offers"][0]["store_icon_url"], self.store.icon_url)

    def setUp(self):
        self.url = reverse("shooter:game-list")
        self.store = Store.objects.create(
            cheapshark_id="1",
            name="Steam",
        )

    def create_available_game(
        self,
        title,
        price="9.99",
        is_active=True,
        store=None,
    ):
        game = ShooterGame.objects.create(
            title=title,
            image_url="https://example.com/game.jpg",
        )
        GameOffer.objects.create(
            game=game,
            store=store if store is not None else self.store,
            cheapshark_deal_id=f"offer-{game.pk}",
            price=Decimal(price),
            retail_price=Decimal("19.99"),
            currency="USD",
            is_active=is_active,
            last_synced_at=timezone.now(),
        )
        return game

    def test_anonymous_user_sees_only_available_games_including_free(self):
        free_game = self.create_available_game("Gratis", price="0.00")
        ShooterGame.objects.create(title="Sin ofertas")
        self.create_available_game("Oferta inactiva", is_active=False)

        inactive_store = Store.objects.create(
            cheapshark_id="3",
            name="Tienda inactiva",
            is_active=False,
        )
        self.create_available_game(
            "Tienda inactiva",
            store=inactive_store,
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"], [
            {
                "id": free_game.pk,
                "title": "Gratis",
                "image_url": "https://example.com/game.jpg",
                "lowest_price": "0.00",
                "currency": "USD",
            },
        ])

    def test_paginates_catalog_in_title_order(self):
        second = self.create_available_game("Zulu")
        first = self.create_available_game("Alpha")

        response = self.client.get(self.url, {"page_size": 1})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(response.data["results"][0]["id"], first.pk)
        self.assertIsNotNone(response.data["next"])
        self.assertIsNone(response.data["previous"])

        response = self.client.get(
            self.url,
            {"page_size": 1, "page": 2},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["results"][0]["id"], second.pk)
        self.assertIsNone(response.data["next"])
        self.assertIsNotNone(response.data["previous"])

    def test_returns_empty_paginated_catalog(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 0)
        self.assertEqual(response.data["results"], [])
        self.assertIsNone(response.data["next"])
        self.assertIsNone(response.data["previous"])

    def test_public_catalog_does_not_allow_creation(self):
        response = self.client.post(
            self.url,
            {"title": "Nuevo juego"},
            format="json",
        )

        self.assertEqual(response.status_code, 405)
        self.assertFalse(ShooterGame.objects.exists())

    def test_detail_returns_available_offers_ordered_by_price(self):
        game = self.create_available_game("Portal 2", price="9.99")
        game.description = "Descripción del juego"
        game.save(update_fields=["description"])

        other_store = Store.objects.create(
            cheapshark_id="3",
            name="Otra tienda",
        )

        def add_offer(deal_id, store, price, **extra):
            return GameOffer.objects.create(
                game=game,
                store=store,
                cheapshark_deal_id=deal_id,
                price=Decimal(price),
                retail_price=Decimal("19.99"),
                last_synced_at=timezone.now(),
                **extra,
            )

        cheaper = add_offer("cheaper", other_store, "7.99")
        add_offer("inactive", self.store, "1.00", is_active=False)
        add_offer("eur", self.store, "2.00", currency="EUR")

        inactive_store = Store.objects.create(
            cheapshark_id="4",
            name="Tienda inactiva",
            is_active=False,
        )
        add_offer("inactive-store", inactive_store, "3.00")

        url = reverse("shooter:game-detail", kwargs={"pk": game.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["description"], game.description)
        self.assertEqual(response.data["lowest_price"], "7.99")

        offers = response.data["offers"]
        self.assertEqual(len(offers), 2)
        self.assertEqual(
            [
                (offer["store_name"], offer["price"])
                for offer in offers
            ],
            [("Otra tienda", "7.99"), ("Steam", "9.99")],
        )
        self.assertEqual(offers[0]["id"], cheaper.pk)
        self.assertEqual(offers[0]["store_id"], other_store.pk)
        self.assertEqual(offers[0]["retail_price"], "19.99")
        self.assertEqual(offers[0]["currency"], "USD")
        self.assertIsNotNone(offers[0]["last_synced_at"])
        self.assertEqual(
            offers[0]["purchase_url"],
            "https://www.cheapshark.com/redirect?dealID=cheaper",
        )

    def test_detail_returns_404_for_unavailable_game(self):
        game = self.create_available_game(
            "No disponible",
            is_active=False,
        )
        url = reverse("shooter:game-detail", kwargs={"pk": game.pk})

        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)

    def test_detail_returns_404_for_deleted_game(self):
        game = self.create_available_game("Eliminado")
        game_pk = game.pk
        game.delete()
        url = reverse("shooter:game-detail", kwargs={"pk": game_pk})

        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)
