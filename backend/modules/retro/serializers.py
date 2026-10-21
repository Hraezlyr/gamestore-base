from rest_framework import serializers
from .models import RetroGame

class RetroGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetroGame
        fields = '__all__'