from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import EstrategiaGame


class EstrategiaModelTest(TestCase):
    def setUp(self):
        self.game = EstrategiaGame.objects.create(
            title="Prueba Unitaria", price=29.99, stock=5
        )

    def test_datos_correctos(self):
        self.assertEqual(self.game.title, "Prueba Unitaria")
        self.assertEqual(self.game.stock, 5)

    def test_str_devuelve_titulo(self):
        self.assertEqual(str(self.game), "Prueba Unitaria")


class EstrategiaAPITest(APITestCase):
    def setUp(self):
        self.game = EstrategiaGame.objects.create(
            title="Juego API", price=19.99, stock=3
        )
        self.list_url = reverse('estrategia-list')
        self.detail_url = reverse('estrategia-detail', args=[self.game.pk])

    def test_get_catalogo_status_200(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_crear_juego(self):
        data = {
            "title": "Age of Empires II",
            "price": "19.99",
            "stock": 10,
            "subgenre": "RTS",
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(EstrategiaGame.objects.count(), 2)

    def test_actualizar_juego(self):
        data = {"title": "Juego API v2", "price": "24.99", "stock": 7}
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.game.refresh_from_db()
        self.assertEqual(self.game.title, "Juego API v2")
        self.assertEqual(self.game.stock, 7)

    def test_eliminar_juego(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(EstrategiaGame.objects.count(), 0)

    def test_crear_sin_titulo_devuelve_400(self):
        response = self.client.post(self.list_url, {"price": "10.00"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
