from rest_framework import serializers
from .models import moduloRPGs

class moduloRPGsSerializer(serializers.ModelSerializer):
    class Meta:
        model = moduloRPGs
        fields = ['id', 'title', 'description', 'price', 'stock', 'image_url', 'subgenre']
