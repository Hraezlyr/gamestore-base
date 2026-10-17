from rest_framework import serializers
from .models import ModuloAsignadoGame

class ModuloAsignadoGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuloAsignadoGame
        fields = ['id', 'title', 'description', 'price', 'stock', 'image_url', 'subgenre']