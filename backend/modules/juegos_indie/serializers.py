from rest_framework import serializers
from .models import JuegosIndieGame

class JuegosIndieGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = JuegosIndieGame
        fields = ['id', 'title', 'description', 'price', 'stock', 'image_url', 'subgenre']