from rest_framework import serializers
from .models import DeportesGame


class DeportesGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeportesGame
        fields = ['id', 'title', 'description', 'price', 'stock', 'image_url', 'subgenre']