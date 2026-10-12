from django.db import models

class Anuncio(models.Model):
    TIPO_CHOICES = [
        ('ARMA', 'Arma'),
        ('PERSONAJE', 'Personaje'),
        ('PASE', 'Pase de Batalla'),
        ('OTRO', 'Otro'),
    ]

    titulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='OTRO')
    imagen_url = models.URLField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} - {self.tipo}"
