from django.db import models


class GiftCard(models.Model):
    title = models.CharField(max_length=150, verbose_name="Título del Juego")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    stock = models.PositiveIntegerField(default=0, verbose_name="Stock disponible")
    image_url = models.URLField(blank=True, null=True, verbose_name="URL de Portada")
    subgenre = models.CharField(max_length=50, blank=True, null=True, verbose_name="Subgénero")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class GiftCardCode(models.Model):
    """Cupón de saldo de un solo uso."""

    code = models.CharField(max_length=9, unique=True)  # formato XXXX-XXXX
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_redeemed = models.BooleanField(default=False)
    redeemed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        state = "canjeado" if self.is_redeemed else "disponible"
        return f"{self.code} ({self.amount}) - {state}"
