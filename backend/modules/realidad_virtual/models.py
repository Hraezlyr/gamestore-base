from django.db import models


class RealidadVirtual(models.Model):
    title = models.CharField(max_length=150, verbose_name="Título del Juego")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    stock = models.PositiveIntegerField(default=0, verbose_name="Stock disponible")
    image_url = models.URLField(blank=True, null=True, verbose_name="URL de Portada")
    subgenre = models.CharField(max_length=50, blank=True, null=True, verbose_name="Subgénero")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class HardwareCompatibility(models.Model):
    HEADSET_CHOICES = [
        ("Quest 2", "Quest 2"),
        ("Quest 3", "Quest 3"),
    ]
    GPU_CHOICES = [
        ("NVIDIA RTX 3060", "NVIDIA RTX 3060"),
        ("NVIDIA RTX 4090", "NVIDIA RTX 4090"),
    ]
    COMPATIBILITY_CHOICES = [
        ("alta", "Alta"),
        ("media", "Media"),
        ("baja", "Baja"),
    ]

    game = models.ForeignKey(
        RealidadVirtual,
        on_delete=models.CASCADE,
        related_name="hardware_compatibilities",
    )
    visor = models.CharField(max_length=20, choices=HEADSET_CHOICES)
    gpu = models.CharField(max_length=30, choices=GPU_CHOICES)
    compatibility = models.CharField(
        max_length=10,
        choices=COMPATIBILITY_CHOICES,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("game", "visor", "gpu"),
                name="unique_vr_game_hardware_combination",
            )
        ]

    def __str__(self):
        return f"{self.game}: {self.visor} + {self.gpu} ({self.compatibility})"