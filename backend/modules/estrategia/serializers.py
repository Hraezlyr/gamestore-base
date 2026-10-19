from rest_framework import serializers

from .models import EstrategiaGame


class EstrategiaGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstrategiaGame
        fields = ['id', 'title', 'description', 'price', 'stock', 'image_url', 'subgenre']
