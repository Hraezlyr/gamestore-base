from rest_framework import serializers
from .models import PerifericosGame

class PerifericosGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerifericosGame
        fields = ['id', 'title', 'description', 'price', 'stock', 'image_url', 'subgenre']
