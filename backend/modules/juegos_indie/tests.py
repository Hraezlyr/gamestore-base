from rest_framework.test import APITestCase
from rest_framework import status
from .models import JuegoIndie

class JuegosIndieTestCase(APITestCase):
    def setUp(self):
        self.juego = JuegoIndie.objects.create(
            nombre="Hollow Knight",
            descripcion="Metroidvania indie de acción",
            precio=14.99,
            boosts=0
        )

    # --- Pruebas del Sprint 1 ---
    def test_listar_juegos(self):
        response = self.client.get('/api/v1/juegos_indie/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_health_check(self):
        response = self.client.get('/api/v1/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # --- Nuevas Pruebas del Sprint 2 ---
    def test_support_dev_success(self):
        url = f"/api/v1/juegos_indie/{self.juego.id}/support-dev/"
        payload = {"comment": "¡Gran trabajo con el juego!"}
        
        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.juego.refresh_from_db()
        self.assertEqual(self.juego.boosts, 1) # Verifica que se incrementó el contador
        self.assertEqual(response.data["boosts"], 1)

    # b. Prueba de Error de Validación (400 Bad Request)
    def test_support_dev_malformed_body(self):
        url = f"/api/v1/juegos_indie/{self.juego.id}/support-dev/"
        
        # Enviamos un cuerpo con sintaxis inválida (no JSON)
        response = self.client.post(
            url, 
            "cuerpo_invalido_sin_formato_json", 
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.juego.refresh_from_db()
        self.assertEqual(self.juego.boosts, 0) # La base de datos no debió alterarse