from django.db import models


class EstrategiaGame(models.Model):
    title = models.CharField(max_length=150, verbose_name="Título del Juego")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    stock = models.PositiveIntegerField(default=0, verbose_name="Stock disponible")
    image_url = models.URLField(blank=True, null=True, verbose_name="URL de Portada")
    subgenre = models.CharField(max_length=50, blank=True, null=True, verbose_name="Subgénero")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Faction(models.Model):
    """Facción (o bando) jugable de un juego de estrategia."""

    class PlayStyle(models.TextChoices):
        OFENSIVO = 'ofensivo', 'Ofensivo'
        DEFENSIVO = 'defensivo', 'Defensivo'
        ECONOMICO = 'economico', 'Económico'

    game = models.ForeignKey(
        EstrategiaGame,
        on_delete=models.CASCADE,
        related_name='factions',
        verbose_name="Juego",
    )
    name = models.CharField(max_length=100, verbose_name="Nombre de la facción")
    description = models.TextField(blank=True, default='', verbose_name="Descripción")
    play_style = models.CharField(
        max_length=20,
        choices=PlayStyle.choices,
        verbose_name="Estilo de juego",
    )
    advantages = models.JSONField(default=list, blank=True, verbose_name="Ventajas")
    unique_units = models.JSONField(default=list, blank=True, verbose_name="Unidades únicas")

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.game.title})"
