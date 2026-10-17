from django.db import models

class JuegoIndie(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    boosts = models.PositiveIntegerField(default=0)
    def __str__(self):
        return self.nombre