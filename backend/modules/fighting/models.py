from django.db import models


class FightingCharacter(models.Model):
    name = models.CharField(max_length=100)
    game_title = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.name} ({self.game_title})"


class Move(models.Model):
    CATEGORY_CHOICES = [
        ('Normal', 'Normal'),
        ('Especial', 'Especial'),
        ('Super', 'Super'),
    ]

    character = models.ForeignKey(
        FightingCharacter,
        on_delete=models.CASCADE,
        related_name='moves'
    )
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    input_command = models.CharField(max_length=100)  # Ej: "↓ ↘ → + P"
    damage = models.IntegerField(default=0)
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.name} - {self.category} ({self.character.name})"