from rest_framework import serializers
from .models import AventuraGraficaGame

class AventuraGraficaGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = AventuraGraficaGame
        fields = ['id', 'title', 'description', 'price', 'stock', 'image_url', 'subgenre']