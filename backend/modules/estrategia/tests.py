from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import EstrategiaGame, Faction


class EstrategiaModelTest(TestCase):
    def setUp(self):
        self.game = EstrategiaGame.objects.create(
            title="Prueba Unitaria", price=29.99, stock=5
        )

    def test_datos_correctos(self):
        self.assertEqual(self.game.title, "Prueba Unitaria")
        self.assertEqual(self.game.stock, 5)

    def test_str_devuelve_titulo(self):
        self.assertEqual(str(self.game), "Prueba Unitaria")


class EstrategiaAPITest(APITestCase):
    def setUp(self):
        self.game = EstrategiaGame.objects.create(
            title="Juego API", price=19.99, stock=3
        )
        self.list_url = reverse('estrategia-list')
        self.detail_url = reverse('estrategia-detail', args=[self.game.pk])

    def test_get_catalogo_status_200(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_crear_juego(self):
        data = {
            "title": "Age of Empires II",
            "price": "19.99",
            "stock": 10,
            "subgenre": "RTS",
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(EstrategiaGame.objects.count(), 2)

    def test_actualizar_juego(self):
        data = {"title": "Juego API v2", "price": "24.99", "stock": 7}
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.game.refresh_from_db()
        self.assertEqual(self.game.title, "Juego API v2")
        self.assertEqual(self.game.stock, 7)

    def test_eliminar_juego(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(EstrategiaGame.objects.count(), 0)

    def test_crear_sin_titulo_devuelve_400(self):
        response = self.client.post(self.list_url, {"price": "10.00"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class EstrategiaFactionsActionTest(APITestCase):
    """Sprint 2: GET /api/v1/estrategia/{id}/factions/ con filtro por estilo."""

    def setUp(self):
        self.game = EstrategiaGame.objects.create(
            title="Juego con facciones", price=19.99, stock=3
        )
        self.otro_juego = EstrategiaGame.objects.create(
            title="Otro juego", price=9.99, stock=1
        )
        Faction.objects.create(
            game=self.game,
            name="Vanguardia",
            play_style=Faction.PlayStyle.OFENSIVO,
            advantages=["Ataque inicial fuerte"],
            unique_units=["Lancero pesado"],
        )
        Faction.objects.create(
            game=self.game,
            name="Muralla",
            play_style=Faction.PlayStyle.DEFENSIVO,
            advantages=["Torres más resistentes"],
            unique_units=["Guardián"],
        )
        Faction.objects.create(
            game=self.game,
            name="Mercaderes",
            play_style=Faction.PlayStyle.ECONOMICO,
            advantages=["Recolección más rápida"],
            unique_units=["Caravana"],
        )
        # Facción de OTRO juego: nunca debe aparecer en las respuestas de self.game
        Faction.objects.create(
            game=self.otro_juego,
            name="Intrusa",
            play_style=Faction.PlayStyle.OFENSIVO,
        )
        self.url = reverse('estrategia-factions', args=[self.game.pk])

    def test_filtra_facciones_por_estilo_ofensivo(self):
        """Camino feliz: 200 y solo facciones ofensivas del juego pedido."""
        response = self.client.get(self.url, {'style': 'Ofensivo'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['style'], 'ofensivo')
        self.assertEqual(response.data['factions'][0]['name'], "Vanguardia")
        self.assertEqual(response.data['factions'][0]['play_style_display'], "Ofensivo")

    def test_sin_filtro_devuelve_todas_las_del_juego(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 3)
        nombres = {f['name'] for f in response.data['factions']}
        self.assertNotIn("Intrusa", nombres)

    def test_filtro_acepta_tildes_y_mayusculas(self):
        response = self.client.get(self.url, {'style': 'Económico'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['factions'][0]['name'], "Mercaderes")

        response = self.client.get(self.url, {'style': 'DEFENSIVO'})
        self.assertEqual(response.data['factions'][0]['name'], "Muralla")

    def test_estilo_invalido_devuelve_400_sin_alterar_la_bd(self):
        """Error de validación: 400 y la base de datos queda igual."""
        total_antes = Faction.objects.count()
        response = self.client.get(self.url, {'style': 'Magico'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('style', response.data)
        self.assertEqual(Faction.objects.count(), total_antes)

    def test_juego_inexistente_devuelve_404(self):
        url = reverse('estrategia-factions', args=[99999])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
