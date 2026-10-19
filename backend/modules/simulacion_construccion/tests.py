from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import SimulationGame, SimulationDLC

class SimulationDLCTests(APITestCase):
    def setUp(self):
        self.game = SimulationGame.objects.create(
            title="Simulador de Ciudades",
            price=29.99,
            stock=10
        )
        self.dlc = SimulationDLC.objects.create(
            game=self.game,
            name="Expansión Tráfico Urbano",
            size_gb=5.50,
            is_installed=False
        )
        self.url = f"/api/v1/simulacion_construccion/{self.game.id}/toggle-dlc/"

    def test_toggle_dlc_exitoso(self):
        """Prueba de Camino Feliz: Alterna el estado del DLC de False a True correctamente"""
        payload = {"dlc_id": self.dlc.id}
        response = self.client.post(self.url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.dlc.refresh_from_db()
        self.assertTrue(self.dlc.is_installed)
        self.assertEqual(float(response.data['total_installed_size_gb']), 5.50)

    def test_toggle_dlc_id_invalido(self):
        """Prueba de Error de Validación: Envía un DLC ID que no existe y retorna 404"""
        payload = {"dlc_id": 9999}
        response = self.client.post(self.url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("error", response.data)
