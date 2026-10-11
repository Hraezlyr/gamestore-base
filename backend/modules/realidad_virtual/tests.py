from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import RealidadVirtual


class RealidadVirtualModelTest(TestCase):
    def setUp(self):
        self.game = RealidadVirtual.objects.create(
            title="Prueba Unitaria", price=29.99, stock=5
        )

    def test_datos_correctos(self):
        self.assertEqual(self.game.title, "Prueba Unitaria")
        self.assertEqual(self.game.stock, 5)


class RealidadVirtualAPITest(APITestCase):
    def setUp(self):
        RealidadVirtual.objects.create(title="Juego API", price=19.99, stock=3)
        self.list_url = reverse('realidad_virtual-list')

    def test_get_catalogo_status_200(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)