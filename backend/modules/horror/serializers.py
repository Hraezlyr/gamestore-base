from rest_framework import serializers

from .models import HorrorGame


class HorrorGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorrorGame
        fields = ['id', 'title', 'description', 'price', 'stock', 'image_url', 'subgenre']
