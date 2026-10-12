from rest_framework.test import APITestCase
from rest_framework import status

class JuegosIndieTestCase(APITestCase):
    def test_listar_juegos(self):
        response = self.client.get('/api/v1/juegos_indie/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_health_check(self):
        response = self.client.get('/api/v1/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)