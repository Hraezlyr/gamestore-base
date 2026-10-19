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
        self.game = RealidadVirtual.objects.create(
            title="Juego API", price=19.99, stock=3
        )
        self.list_url = reverse('realidad_virtual-list')
        self.hardware_url = reverse(
            'realidad_virtual-check-hardware', kwargs={'pk': self.game.pk}
        )

    def test_get_catalogo_status_200(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_check_hardware_returns_simulated_compatibility_levels(self):
        examples = (
            ("Quest 3", "NVIDIA RTX 4090", "alta"),
            ("Quest 3", "NVIDIA RTX 3060", "media"),
            ("Quest 2", "NVIDIA RTX 4090", "baja"),
            ("Quest 2", "NVIDIA RTX 3060", "incompatible"),
        )

        for visor, gpu, level in examples:
            with self.subTest(visor=visor, gpu=gpu):
                response = self.client.post(
                    self.hardware_url,
                    {"visor": visor, "gpu": gpu},
                    format="json",
                )

                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(
                    response.data["compatible"], level != "incompatible"
                )
                self.assertEqual(response.data["compatibilidad"], level)
                self.assertEqual(response.data["id"], self.game.pk)
                self.assertTrue(response.data["simulada"])

    def test_check_hardware_rejects_empty_fields_without_creating_game(self):
        game_count = RealidadVirtual.objects.count()
        response = self.client.post(
            self.hardware_url,
            {'visor': '', 'gpu': ''},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(RealidadVirtual.objects.count(), game_count)