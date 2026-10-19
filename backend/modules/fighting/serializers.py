from rest_framework import serializers
from .models import FightingCharacter, Move


class MoveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Move
        fields = ['id', 'name', 'category', 'input_command', 'damage', 'description']


class FightingCharacterSerializer(serializers.ModelSerializer):
    class Meta:
        model = FightingCharacter
        fields = ['id', 'name', 'game_title', 'description']