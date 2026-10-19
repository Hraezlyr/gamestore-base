from django.core.validators import MinValueValidator
from django.db import models


class moduloRPGs(models.Model):
    title = models.CharField(max_length=150, verbose_name="Título del Juego")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    stock = models.PositiveIntegerField(default=0, verbose_name="Stock disponible")
    image_url = models.URLField(blank=True, null=True, verbose_name="URL de Portada")
    subgenre = models.CharField(max_length=50, blank=True, null=True, verbose_name="Subgénero")
    created_at = models.DateTimeField(auto_now_add=True)

    max_level = models.PositiveIntegerField(
        default=50, validators=[MinValueValidator(1)], verbose_name="Nivel máximo"
    )
    base_points = models.PositiveIntegerField(default=5, verbose_name="Puntos iniciales (nivel 1)")
    points_per_level = models.PositiveIntegerField(default=3, verbose_name="Puntos por nivel")

    def __str__(self):
        return self.title

    def total_attribute_points(self, target_level):
        return self.base_points + (target_level - 1) * self.points_per_level
