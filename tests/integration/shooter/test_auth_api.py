from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase


class ShooterAuthApiTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.password = "Test-password-123!"
        user_model = get_user_model()
        user_model.objects.create_user(
            username="admin",
            password=cls.password,
            is_staff=True,
        )
        user_model.objects.create_user(
            username="client",
            password=cls.password,
        )

    def setUp(self):
        self.token_url = reverse("shooter:token-obtain")
        self.refresh_url = reverse("shooter:token-refresh")
        self.admin_url = reverse("shooter:admin-game-list")

    def login(self, username):
        response = self.client.post(
            self.token_url,
            {
                "username": username,
                "password": self.password,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        return response.data

    def test_admin_access_token_allows_admin_access(self):
        tokens = self.login("admin")
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {tokens['access']}",
        )

        response = self.client.get(self.admin_url)

        self.assertEqual(response.status_code, 200)

    def test_normal_user_token_does_not_grant_admin_permissions(self):
        tokens = self.login("client")
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {tokens['access']}",
        )

        response = self.client.get(self.admin_url)

        self.assertEqual(response.status_code, 403)

    def test_wrong_password_does_not_return_tokens(self):
        response = self.client.post(
            self.token_url,
            {
                "username": "admin",
                "password": "wrong-password",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 401)
        self.assertNotIn("access", response.data)
        self.assertNotIn("refresh", response.data)

    def test_refresh_returns_usable_access_token(self):
        tokens = self.login("admin")

        response = self.client.post(
            self.refresh_url,
            {"refresh": tokens["refresh"]},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}",
        )

        response = self.client.get(self.admin_url)

        self.assertEqual(response.status_code, 200)

    def test_invalid_token_does_not_allow_admin_access(self):
        self.client.credentials(
            HTTP_AUTHORIZATION="Bearer invalid-token",
        )

        response = self.client.get(self.admin_url)

        self.assertEqual(response.status_code, 401)