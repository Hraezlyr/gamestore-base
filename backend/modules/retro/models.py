from django.db import models

class RetroGame(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    
    # Campos Sprint 2:
    total_chapters = models.PositiveIntegerField(default=10)
    current_chapter = models.PositiveIntegerField(default=0)
    progress_percentage = models.FloatField(default=0.0)

    class Meta:
        app_label = 'retro'

    def calculate_progress(self, chapter):
        self.current_chapter = chapter
        self.progress_percentage = round((chapter / self.total_chapters) * 100, 2)
        self.save()

    def __str__(self):
        return self.title
    