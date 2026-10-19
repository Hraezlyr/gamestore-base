from rest_framework import serializers
from .models import moduloRPGs

ATTRIBUTES = ('strength', 'dexterity', 'magic', 'vitality')

class moduloRPGsSerializer(serializers.ModelSerializer):
    class Meta:
        model = moduloRPGs
        fields = [
            'id', 'title', 'description', 'price', 'stock', 'image_url', 'subgenre',
            'max_level', 'base_points', 'points_per_level',
        ]

class BuildCalculatorSerializer(serializers.Serializer):
    target_level = serializers.IntegerField(min_value=1)
    strength = serializers.IntegerField(min_value=0, default=0)
    dexterity = serializers.IntegerField(min_value=0, default=0)
    magic = serializers.IntegerField(min_value=0, default=0)
    vitality = serializers.IntegerField(min_value=0, default=0)

    def validate_target_level(self, value):
        game = self.context['game']
        if value > game.max_level:
            raise serializers.ValidationError(
                f"El nivel máximo de este juego es {game.max_level}."
            )
        return value

    def validate(self, attrs):
        game = self.context['game']
        total = game.total_attribute_points(attrs['target_level'])
        spent = sum(attrs[name] for name in ATTRIBUTES)
        if spent > total:
            raise serializers.ValidationError(
                f"Repartiste {spent} puntos, pero solo hay {total} disponibles."
            )
        attrs['total_points'] = total
        attrs['spent_points'] = spent
        return attrs