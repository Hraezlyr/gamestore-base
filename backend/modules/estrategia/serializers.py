from rest_framework import serializers

from .models import EstrategiaGame, Faction


class EstrategiaGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstrategiaGame
        fields = ['id', 'title', 'description', 'price', 'stock', 'image_url', 'subgenre']


class FactionSerializer(serializers.ModelSerializer):
    play_style_display = serializers.CharField(
        source='get_play_style_display', read_only=True
    )

    class Meta:
        model = Faction
        fields = [
            'id',
            'name',
            'description',
            'play_style',
            'play_style_display',
            'advantages',
            'unique_units',
        ]
