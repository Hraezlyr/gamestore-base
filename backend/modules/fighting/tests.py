from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import FightingCharacter, Move


class FightingMoveListTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.character = FightingCharacter.objects.create(
            name="Ryu",
            game_title="Street Fighter V",
            description="Master of Ansatsuken"
        )
        self.move_normal = Move.objects.create(
            character=self.character,
            name="Punch",
            category="Normal",
            input_command="P",
            damage=30
        )
        self.move_special = Move.objects.create(
            character=self.character,
            name="Hadoken",
            category="Especial",
            input_command="↓ ↘ → + P",
            damage=100
        )

    def test_get_move_list_happy_path(self):
        """Prueba éxito (200 OK) consultando movimientos válidos con filtro."""
        url = f"/api/v1/fighting/{self.character.id}/move-list/?category=Especial"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Hadoken")

    def test_get_move_list_invalid_category(self):
        """Prueba error (400 Bad Request) si se envía una categoría inexistente."""
        url = f"/api/v1/fighting/{self.character.id}/move-list/?category=Invalida"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)