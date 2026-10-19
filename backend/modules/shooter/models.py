from decimal import Decimal

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Store(models.Model):
    cheapshark_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=120)
    icon_url = models.URLField(max_length=1000, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

class ShooterGame(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image_url = models.URLField(max_length=1000, blank=True)

    rawg_id = models.PositiveIntegerField(
        unique=True,
        null=True,
        blank=True,
    )
    cheapshark_id = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
    )
    steam_app_id = models.CharField(max_length=20, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title", "id"]

    def __str__(self):
        return self.title

class GameScreenshot(models.Model):
    game = models.ForeignKey(
        ShooterGame,
        on_delete=models.CASCADE,
        related_name="screenshots",
    )
    rawg_id = models.PositiveIntegerField()
    image_url = models.URLField(max_length=1000)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["game", "rawg_id"],
                name="shooter_game_screenshot_unique",
            ),
        ]


class GameOffer(models.Model):
    game = models.ForeignKey(
        ShooterGame,
        on_delete=models.CASCADE,
        related_name="offers",
    )
    store = models.ForeignKey(
        Store,
        on_delete=models.PROTECT,
        related_name="offers",
    )
    cheapshark_deal_id = models.CharField(
        max_length=255,
        unique=True,
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    retail_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    currency = models.CharField(max_length=3, default="USD")
    last_synced_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["price", "id"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(price__gte=0),
                name="shooter_offer_price_nonnegative",
            ),
            models.CheckConstraint(
                condition=models.Q(retail_price__gte=0),
                name="shooter_offer_retail_nonnegative",
            ),
        ]

    def __str__(self):
        return f"{self.game.title} — {self.store.name}"


class GameRating(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="shooter_ratings",
    )
    game = models.ForeignKey(
        "shooter.ShooterGame", on_delete=models.CASCADE, related_name="ratings",
    )
    score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    comment = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "shooter_sprint2_gamerating"
        ordering = ["-created_at", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["game", "user"], name="shooter_sprint2_one_rating_per_user",
            ),
            models.CheckConstraint(
                condition=models.Q(score__gte=1, score__lte=5),
                name="shooter_sprint2_rating_score_range",
            ),
        ]
