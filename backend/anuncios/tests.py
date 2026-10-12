from django.test import TestCase
from .models import Anuncio

class AnuncioTestCase(TestCase):
    def test_crear_anuncio(self):
        anuncio = Anuncio.objects.create(
            titulo="Espada de Prueba",
            descripcion="Descripción de prueba",
            precio=99.99,
            tipo="ARMA"
        )
        self.assertEqual(anuncio.titulo, "Espada de Prueba")