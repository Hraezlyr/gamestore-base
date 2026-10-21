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

class AventuraGraficaSprint2Tests(APITestCase):
    def setUp(self):
        self.adventure = AventuraGraficaGame.objects.create(
            title="Misterio en la Mansión",
            price=10.00,  # Campo obligatorio del Sprint 1
            total_chapters=10,
            current_chapter=2
        )
        # ¡Corregido aquí para que coincida con el basename del router!
        self.url = reverse('aventura_grafica-log-progress', kwargs={'pk': self.adventure.pk})

    def test_log_progress_happy_path(self):
        """Prueba de Camino Feliz: Envía datos válidos y verifica status 200 y porcentaje correcto."""
        data = {'chapter': 5}
        response = self.client.post(self.url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.adventure.refresh_from_db()
        self.assertEqual(self.adventure.current_chapter, 5)
        self.assertEqual(self.adventure.progress_percentage, 50.0)

    def test_log_progress_validation_error(self):
        """Prueba de Error de Validación: Envía un capítulo superior al total y verifica status 400 sin alterar la BD."""
        data = {'chapter': 15}
        response = self.client.post(self.url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.adventure.refresh_from_db()
        self.assertEqual(self.adventure.current_chapter, 2)