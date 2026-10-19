from django.db import models

class AventuraGraficaGame(models.Model):
    title = models.CharField(max_length=150, verbose_name="Título del Juego")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    stock = models.PositiveIntegerField(default=0, verbose_name="Stock disponible")
    image_url = models.URLField(blank=True, null=True, verbose_name="URL de Portada")
    subgenre = models.CharField(max_length=50, blank=True, null=True, verbose_name="Subgénero")
    created_at = models.DateTimeField(auto_now_add=True)

    total_chapters = models.PositiveIntegerField(default=10, verbose_name="Total de Capítulos")
    current_chapter = models.PositiveIntegerField(default=0, verbose_name="Capítulo Actual")
    progress_percentage = models.FloatField(default=0.0, verbose_name="Porcentaje de Avance")

    def __str__(self):
        return self.title

    def update_progress(self, chapter):
        if chapter > self.total_chapters:
            raise ValueError("El capítulo no puede ser mayor al total disponible.")
        self.current_chapter = chapter
        self.progress_percentage = (chapter / self.total_chapters) * 100.0
        self.save()