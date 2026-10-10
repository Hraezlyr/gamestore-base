from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import JuegosIndieGame

class JuegosIndieModelTest(TestCase):
    def setUp(self):
        self.game = JuegosIndieGame.objects.create(
            title="Hades", price=24.99, stock=8, subgenre="Roguelike"
        )

    def test_datos_correctos(self):
        self.assertEqual(self.game.title, "Hades")
        self.assertEqual(self.game.stock, 8)

class JuegosIndieAPITest(APITestCase):
    def setUp(self):
        JuegosIndieGame.objects.create(title="Dead Cells", price=24.99, stock=5)
        self.list_url = reverse('juegos_indie-list')

    def test_get_catalogo_status_200(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)