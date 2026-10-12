from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from shooter.models import ShooterGame


class AdminGameApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.admin = user_model.objects.create_user(
            username="admin",
            is_staff=True,
        )
        self.user = user_model.objects.create_user(username="client")
        self.game = ShooterGame.objects.create(
            title="Portal 2",
            rawg_id=4200,
            cheapshark_id="36",
            steam_app_id="620",
        )
        self.list_url = reverse("shooter:admin-game-list")
        self.detail_url = reverse(
            "shooter:admin-game-detail",
            kwargs={"pk": self.game.pk},
        )

    def assert_access_denied(self, expected_status):
        requests = (
            ("get", self.list_url, None),
            ("post", self.list_url, {"title": "Nuevo"}),
            ("get", self.detail_url, None),
            ("put", self.detail_url, {"title": "Cambio"}),
            ("patch", self.detail_url, {"title": "Cambio"}),
            ("delete", self.detail_url, None),
        )

        for method, url, data in requests:
            with self.subTest(method=method, url=url):
                response = getattr(self.client, method)(
                    url,
                    data=data,
                    format="json",
                )
                self.assertEqual(response.status_code, expected_status)

        self.game.refresh_from_db()
        self.assertEqual(self.game.title, "Portal 2")
        self.assertEqual(ShooterGame.objects.count(), 1)
        self.assertEqual(response.status_code, expected_status)

    def test_rejects_anonymous_user(self):
        self.assert_access_denied(401)

    def test_rejects_authenticated_non_admin(self):
        self.client.force_authenticate(user=self.user)
        self.assert_access_denied(403)

    def test_admin_lists_and_reads_game_without_offers(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(
            response.data["results"][0]["id"],
            self.game.pk,
        )

        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["rawg_id"], 4200)

    def test_admin_creates_game(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            self.list_url,
            {
                "title": "Nuevo shooter",
                "description": "Descripción",
                "image_url": "https://example.com/game.jpg",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        saved = ShooterGame.objects.get(pk=response.data["id"])
        self.assertEqual(saved.title, "Nuevo shooter")
        self.assertEqual(saved.description, "Descripción")
        self.assertIsNone(saved.rawg_id)
        self.assertIsNone(saved.cheapshark_id)

    def test_admin_updates_metadata_without_changing_external_ids(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            self.detail_url,
            {
                "title": "Título actualizado",
                "description": "Nueva descripción",
                "rawg_id": 999,
                "cheapshark_id": "999",
                "steam_app_id": "999",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.game.refresh_from_db()
        self.assertEqual(self.game.title, "Título actualizado")
        self.assertEqual(self.game.description, "Nueva descripción")
        self.assertEqual(self.game.rawg_id, 4200)
        self.assertEqual(self.game.cheapshark_id, "36")
        self.assertEqual(self.game.steam_app_id, "620")

    def test_admin_cannot_create_game_with_invalid_metadata(self):
        self.client.force_authenticate(user=self.admin)

        for payload in (
            {"title": ""},
            {"title": "x" * 256},
            {"title": "Nuevo", "image_url": "not-a-url"},
        ):
            with self.subTest(payload=payload):
                response = self.client.post(
                    self.list_url,
                    payload,
                    format="json",
                )

                self.assertEqual(response.status_code, 400)

        self.assertEqual(ShooterGame.objects.count(), 1)

    def test_admin_deletes_game(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, 204)
        self.assertFalse(
            ShooterGame.objects.filter(pk=self.game.pk).exists()
        )