import re

from rest_framework import serializers

from .models import GiftCard

CODE_PATTERN = re.compile(r'^[A-Z0-9]{4}-[A-Z0-9]{4}$')


class GiftCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftCard
        fields = '__all__'


class RedeemCodeSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=9)

    def validate_code(self, value):
        normalized = value.strip().upper()
        if not CODE_PATTERN.match(normalized):
            raise serializers.ValidationError('El código debe tener el formato XXXX-XXXX.')
        return normalized
