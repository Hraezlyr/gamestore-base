from rest_framework import serializers
from .models import RetroGame

class RetroGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetroGame
        fields = ['id', 'title', 'description', 'price', 'stock', 'image_url', 'subgenre']