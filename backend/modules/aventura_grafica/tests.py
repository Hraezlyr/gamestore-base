from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import AventuraGraficaGame

class AventuraGraficaModelTest(TestCase):
    def setUp(self):
        self.game = AventuraGraficaGame.objects.create(
            title="Prueba Unitaria Aventura", price=29.99, stock=5
        )

    def test_datos_correctos(self):
        self.assertEqual(self.game.title, "Prueba Unitaria Aventura")
        self.assertEqual(self.game.stock, 5)

class AventuraGraficaAPITest(APITestCase):
    def setUp(self):
        AventuraGraficaGame.objects.create(title="Juego API Aventura", price=19.99, stock=3)
        self.list_url = reverse('aventura_grafica-list')

    def test_get_catalogo_status_200(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)