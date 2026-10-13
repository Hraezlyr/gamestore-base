from rest_framework import serializers
from .models import RealidadVirtual


class RealidadVirtualSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealidadVirtual
        fields = ['id', 'title', 'description', 'price', 'stock', 'image_url', 'subgenre']