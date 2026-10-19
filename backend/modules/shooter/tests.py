from decimal import Decimal
from importlib import import_module
from unittest import SkipTest

from django.apps import apps

if not apps.is_installed("modules.shooter"):
    raise SkipTest("Run with --settings=modules.shooter.test_settings until project integration.")

from django.contrib.auth import get_user_model
from django.db import IntegrityError, connection, transaction
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient, APITestCase

from modules.shooter.models import GameOffer, ShooterGame, Store
from modules.shooter.models import GameRating


class RegistrationApiTests(APITestCase):
    def setUp(self):
        self.url = reverse("shooter:register")
        self.payload = {
            "username": "new-reviewer",
            "password": "Strong-Review-Password-852!",
            "password_confirm": "Strong-Review-Password-852!",
        }

    def test_registration_creates_regular_account_that_can_login(self):
        response = self.client.post(
            self.url, {**self.payload, "is_staff": True, "is_superuser": True}, format="json",
        )
        self.assertEqual(response.status_code, 201)
        user = get_user_model().objects.get(username=self.payload["username"])
        self.assertEqual(response.data, {"id": user.pk, "username": user.username})
        self.assertTrue(user.check_password(self.payload["password"]))
        self.assertNotEqual(user.password, self.payload["password"])
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        login = self.client.post(reverse("shooter:token-obtain"), self.payload, format="json")
        self.assertEqual(login.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        self.assertEqual(self.client.get(reverse("shooter:account")).data["id"], user.pk)
        self.assertEqual(self.client.get(reverse("shooter:admin-game-list")).status_code, 403)

    def test_invalid_registration_does_not_create_accounts(self):
        invalid = [
            {},
            {**self.payload, "username": "invalid username"},
            {**self.payload, "password_confirm": "different"},
            {**self.payload, "password": "123", "password_confirm": "123"},
        ]
        for payload in invalid:
            with self.subTest(payload=payload):
                response = self.client.post(self.url, payload, format="json")
                self.assertEqual(response.status_code, 400)
                self.assertFalse(get_user_model().objects.exists())

    def test_duplicate_registration_preserves_existing_account(self):
        original = get_user_model().objects.create_user(
            username=self.payload["username"], password="Original-Password-741!",
        )
        response = self.client.post(self.url, self.payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(get_user_model().objects.count(), 1)
        original.refresh_from_db()
        self.assertTrue(original.check_password("Original-Password-741!"))


class GameRatingApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="reviewer", password="rating-test-password")
        self.client.force_authenticate(user=self.user)
        self.game = ShooterGame.objects.create(title="Test shooter")
        self.store = Store.objects.create(cheapshark_id="1", name="Steam")
        GameOffer.objects.create(
            game=self.game, store=self.store, cheapshark_deal_id="rating-test",
            price=Decimal("10.00"), retail_price=Decimal("20.00"),
            last_synced_at=timezone.now(),
        )
        self.url = reverse("shooter:game-rate", kwargs={"pk": self.game.pk})
        self.detail_url = self.url

    def test_valid_rating_stores_review_and_recalculates_accumulated_average(self):
        for score, average, count in [(5, 5.0, 1), (2, 3.5, 2), (1, 8 / 3, 3)]:
            with self.subTest(score=score):
                voter = get_user_model().objects.create_user(username=f"voter-{count}")
                self.client.force_authenticate(user=voter)
                response = self.client.post(
                    self.url, {"score": score, "comment": "Buena experiencia"}, format="json",
                )
                self.assertEqual(response.status_code, 201)
                self.assertAlmostEqual(response.data["rating_average"], average)
                self.assertEqual(response.data["rating_count"], count)
                rating = GameRating.objects.get(pk=response.data["rating"]["id"])
                self.assertEqual(rating.game_id, self.game.pk)
                self.assertEqual(rating.score, score)
                self.assertEqual(rating.comment, "Buena experiencia")
                self.assertEqual(rating.user_id, voter.pk)

        detail = self.client.get(self.detail_url)
        self.assertEqual(detail.status_code, 200)
        self.assertAlmostEqual(detail.data["rating_average"], 8 / 3)
        self.assertEqual(detail.data["rating_count"], 3)
        self.assertEqual(detail.data["user_rating"]["score"], 1)

    def test_same_user_cannot_rate_twice_and_other_user_can(self):
        payload = {"score": 5, "comment": "Primera reseña"}
        self.assertEqual(self.client.post(self.url, payload, format="json").status_code, 201)
        response = self.client.post(self.url, {"score": 1, "comment": "Duplicada"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["detail"], "Ya calificaste este juego.")
        self.assertEqual(list(self.game.ratings.values_list("score", "comment")), [(5, "Primera reseña")])
        second = get_user_model().objects.create_user(username="second")
        self.client.force_authenticate(user=second)
        response = self.client.post(self.url, {"score": 3, "comment": "Otra persona"}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["rating_count"], 2)
        self.assertEqual(response.data["rating_average"], 4)
        self.assertEqual(response.data["user_rating"]["score"], 3)

    def test_anonymous_can_read_average_but_cannot_vote(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data["user_rating"])
        response = self.client.post(self.url, {"score": 5, "comment": "Sin cuenta"}, format="json")
        self.assertEqual(response.status_code, 401)
        self.assertFalse(GameRating.objects.exists())

    def test_database_enforces_one_rating_per_user(self):
        GameRating.objects.create(game=self.game, user=self.user, score=5, comment="Original")
        with self.assertRaises(IntegrityError), transaction.atomic():
            GameRating.objects.create(game=self.game, user=self.user, score=4, comment="Duplicada")
        self.assertEqual(GameRating.objects.count(), 1)

    def test_public_reviews_include_author_score_comment_and_paginate(self):
        for number in range(6):
            GameRating.objects.create(game=self.game, score=number % 5 + 1, comment=f"Reseña {number}")
        GameRating.objects.create(game=self.game, user=self.user, score=4, comment="Comentario público")
        other_game = ShooterGame.objects.create(title="Otro juego")
        GameRating.objects.create(game=other_game, user=self.user, score=1, comment="Otro juego")
        self.client.force_authenticate(user=None)
        url = reverse("shooter:game-reviews", kwargs={"pk": self.game.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 7)
        self.assertEqual(len(response.data["results"]), 5)
        first = response.data["results"][0]
        self.assertEqual(first["author"], "reviewer")
        self.assertEqual(first["score"], 4)
        self.assertEqual(first["comment"], "Comentario público")
        self.assertEqual(set(first), {"id", "author", "score", "comment", "created_at"})
        self.assertEqual(response.data["results"][1]["author"], "Usuario anónimo")
        second = self.client.get(url, {"page": 2})
        self.assertEqual(len(second.data["results"]), 2)
        self.assertIsNone(second.data["next"])
        self.assertTrue(second.data["previous"])

    def test_reviews_for_missing_game_return_404(self):
        url = reverse("shooter:game-reviews", kwargs={"pk": self.game.pk + 100})
        self.assertEqual(self.client.get(url).status_code, 404)

    def test_regular_user_can_login_and_cannot_bypass_limit_with_a_new_token(self):
        client = APIClient()
        credentials = {"username": "reviewer", "password": "rating-test-password"}
        token_url = reverse("shooter:token-obtain")
        token = client.post(token_url, credentials, format="json")
        self.assertEqual(token.status_code, 200)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.data['access']}")
        account = client.get(reverse("shooter:account"))
        self.assertEqual(account.status_code, 200)
        self.assertEqual(account.data, {"id": self.user.pk, "username": "reviewer"})
        self.assertFalse(self.user.is_staff)
        response = client.post(self.url, {"score": 4, "comment": "Mi reseña", "user": 999999}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(GameRating.objects.get().user_id, self.user.pk)
        new_token = client.post(token_url, credentials, format="json")
        self.assertEqual(new_token.status_code, 200)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {new_token.data['access']}")
        response = client.post(self.url, {"score": 1, "comment": "Otro token"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(GameRating.objects.count(), 1)

    def test_invalid_payload_does_not_change_ratings_or_average(self):
        GameRating.objects.create(game=self.game, score=4, comment="Original")
        invalid = [
            {"score": score, "comment": "Reseña"}
            for score in (0, 6, -1, 2.5, "invalid", None, True)
        ] + [
            {}, {"score": 5}, {"comment": "Sin nota"},
            {"score": 5, "comment": ""},
            {"score": 5, "comment": "   "},
            {"score": 5, "comment": "x" * 2001},
        ]
        for payload in invalid:
            with self.subTest(payload=str(payload)[:100]):
                response = self.client.post(self.url, payload, format="json")
                self.assertEqual(response.status_code, 400)
                self.assertEqual(list(self.game.ratings.values_list("score", "comment")), [(4, "Original")])
                detail = self.client.get(self.detail_url)
                self.assertEqual(detail.data["rating_average"], 4)
                self.assertEqual(detail.data["rating_count"], 1)

    def test_unknown_or_unavailable_game_returns_404_without_creating_rating(self):
        missing_url = reverse("shooter:game-rate", kwargs={"pk": 999999})
        hidden_game = ShooterGame.objects.create(title="Sin ofertas")
        hidden_url = reverse("shooter:game-rate", kwargs={"pk": hidden_game.pk})
        for url in (missing_url, hidden_url):
            response = self.client.post(url, {"score": 5, "comment": "Reseña"}, format="json")
            self.assertEqual(response.status_code, 404)
        self.assertEqual(GameRating.objects.count(), 0)

    def test_unrated_game_and_multiple_offers_do_not_distort_average(self):
        detail = self.client.get(self.detail_url)
        self.assertIsNone(detail.data["rating_average"])
        self.assertEqual(detail.data["rating_count"], 0)
        GameRating.objects.create(game=self.game, score=1, comment="Una estrella")
        GameRating.objects.create(game=self.game, score=5, comment="Cinco estrellas")
        GameOffer.objects.create(
            game=self.game, store=self.store, cheapshark_deal_id="second-offer",
            price=Decimal("8.00"), retail_price=Decimal("20.00"),
            last_synced_at=timezone.now(),
        )
        detail = self.client.get(self.detail_url)
        self.assertEqual(detail.data["rating_average"], 3)
        self.assertEqual(detail.data["rating_count"], 2)
        catalog_detail = self.client.get(reverse("shooter:game-detail", kwargs={"pk": self.game.pk}))
        self.assertEqual(catalog_detail.data["lowest_price"], "8.00")

    def test_malformed_json_is_rejected(self):
        response = self.client.post(self.url, '{"score":', content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertFalse(GameRating.objects.exists())

    def test_database_rejects_out_of_range_score(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            GameRating.objects.create(game=self.game, score=6, comment="Inválido")

    def test_ratings_use_shooter_app_and_adopt_existing_table_without_changing_reviews(self):
        migration = import_module("modules.shooter.migrations.0004_integrate_game_rating")
        rating = GameRating.objects.create(
            game=self.game, user=self.user, score=4, comment="Existing review",
        )
        before = list(GameRating.objects.values())
        migration.ensure_rating_table(apps, connection.schema_editor())
        self.assertEqual(GameRating._meta.app_label, "shooter")
        self.assertIs(apps.get_model("shooter", "GameRating"), GameRating)
        self.assertNotIn("shooter_sprint2", apps.app_configs)
        self.assertEqual(list(GameRating.objects.values()), before)
        self.assertEqual(self.client.get(self.url).data["user_rating"]["id"], rating.pk)
