from rest_framework import serializers
from .models import JuegoIndie

class JuegoIndieSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='nombre', read_only=True)
    price = serializers.DecimalField(source='precio', max_digits=10, decimal_places=2, read_only=True)
    stock = serializers.SerializerMethodField()

    class Meta:
        model = JuegoIndie
        fields = ['id', 'nombre', 'descripcion', 'precio', 'title', 'price', 'stock']

    def get_stock(self, obj):
        return 10  