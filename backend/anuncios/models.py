from django.db import models

class Anuncio(models.Model):
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    imagen_url = models.URLField(max_length=500, blank=True, null=True)
    votos_interes = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.titulo