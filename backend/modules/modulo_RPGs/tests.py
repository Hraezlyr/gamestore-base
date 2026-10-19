from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import moduloRPGs


class modulo_RPGsModelTest(TestCase):
    def setUp(self):
        self.game = moduloRPGs.objects.create(
            title="Prueba Unitaria", price=29.99, stock=5
        )

    def test_datos_correctos(self):
        self.assertEqual(self.game.title, "Prueba Unitaria")
        self.assertEqual(self.game.stock, 5)

    def test_total_attribute_points(self):
        game = moduloRPGs.objects.create(
            title="Calc", price=10, base_points=5, points_per_level=3
        )
        self.assertEqual(game.total_attribute_points(1), 5)
        self.assertEqual(game.total_attribute_points(10), 32)


class modulo_RPGsAPITest(APITestCase):
    def setUp(self):
        moduloRPGs.objects.create(title="Juego API", price=19.99, stock=3)
        self.list_url = reverse('rpg-list')

    def test_get_catalogo_status_200(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)


class BuildCalculatorAPITest(APITestCase):
    def setUp(self):
        self.game = moduloRPGs.objects.create(
            title="RPG de Prueba", price=39.99, stock=5,
            max_level=50, base_points=5, points_per_level=3,
        )
        self.url = reverse('rpg-build-calculator', args=[self.game.pk])

    def test_build_valida_status_200(self):
        payload = {
            'target_level': 10,
            'strength': 10, 'dexterity': 8, 'magic': 6, 'vitality': 4,
        }
        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_points'], 32)
        self.assertEqual(response.data['spent_points'], 28)
        self.assertEqual(response.data['remaining_points'], 4)
        self.assertEqual(response.data['distribution']['strength'], 10)

    def test_nivel_fuera_de_limites_status_400(self):
        total_antes = moduloRPGs.objects.count()

        response = self.client.post(self.url, {'target_level': 99}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('target_level', response.data)
        self.assertEqual(moduloRPGs.objects.count(), total_antes)
        self.game.refresh_from_db()
        self.assertEqual(self.game.max_level, 50)

    def test_distribucion_excede_puntos_status_400(self):
        payload = {'target_level': 1, 'strength': 6}
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_juego_inexistente_status_404(self):
        url = reverse('rpg-build-calculator', args=[9999])
        response = self.client.post(url, {'target_level': 5}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)