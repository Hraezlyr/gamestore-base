from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import HorrorGame


class HorrorGameModelTest(TestCase):
    def setUp(self):
        self.game = HorrorGame.objects.create(
            title="Prueba Unitaria", price=29.99, stock=5
        )

    def test_datos_correctos(self):
        self.assertEqual(self.game.title, "Prueba Unitaria")
        self.assertEqual(self.game.stock, 5)
        self.assertEqual(str(self.game), "Prueba Unitaria")


class HorrorGameAPITest(APITestCase):
    def setUp(self):
        HorrorGame.objects.create(title="Juego API", price=19.99, stock=3)
        self.list_url = reverse('horror-list')

    def test_get_catalogo_status_200(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "Juego API")

    def test_ruta_publica(self):
        response = self.client.get('/api/v1/horror/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
