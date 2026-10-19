from django.db import models

class SimulationGame(models.Model):
    title = models.CharField(max_length=150, verbose_name="Título del Juego")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    stock = models.PositiveIntegerField(default=0, verbose_name="Stock disponible")
    image_url = models.URLField(blank=True, null=True, verbose_name="URL de Portada")
    subgenre = models.CharField(max_length=50, blank=True, null=True, verbose_name="Subgénero")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class SimulationDLC(models.Model):
    game = models.ForeignKey(SimulationGame, related_name='dlcs', on_delete=models.CASCADE)
    name = models.CharField(max_length=150, verbose_name="Nombre del DLC")
    size_gb = models.DecimalField(max_digits=6, decimal_places=2, verbose_name="Tamaño en GB")
    is_installed = models.BooleanField(default=False, verbose_name="Instalado")

    def __str__(self):
        return f"{self.name} ({'Instalado' if self.is_installed else 'No instalado'})"