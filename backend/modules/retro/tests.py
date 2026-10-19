from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import RetroGame

class RetroProgressTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.game = RetroGame.objects.create(
            title="Super Mario World",
            total_chapters=10,
            current_chapter=0,
            progress_percentage=0.0
        )
        self.url = f'/api/v1/retro/{self.game.id}/log-progress/'

    def test_happy_path_log_progress(self):
        """Camino Feliz: Envía datos válidos y verifica status 200 y progreso"""
        payload = {"chapter": 5}
        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["progress_percentage"], 50.0)
        
        self.game.refresh_from_db()
        self.assertEqual(self.game.current_chapter, 5)
        self.assertEqual(self.game.progress_percentage, 50.0)

    def test_validation_error_exceeds_total_chapters(self):
        """Error de Validación: Capítulo mayor al límite disponible"""
        payload = {"chapter": 15}
        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        self.game.refresh_from_db()
        self.assertEqual(self.game.current_chapter, 0)
        self.assertEqual(self.game.progress_percentage, 0.0)