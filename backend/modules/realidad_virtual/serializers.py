from rest_framework import serializers
from .models import HardwareCompatibility, RealidadVirtual


class HardwareCompatibilityRequestSerializer(serializers.Serializer):
    visor = serializers.ChoiceField(choices=HardwareCompatibility.HEADSET_CHOICES)
    gpu = serializers.ChoiceField(choices=HardwareCompatibility.GPU_CHOICES)

    def validate(self, attrs):
        compatibility_levels = {
            ("Quest 3", "NVIDIA RTX 4090"): "alta",
            ("Quest 3", "NVIDIA RTX 3060"): "media",
            ("Quest 2", "NVIDIA RTX 4090"): "baja",
            ("Quest 2", "NVIDIA RTX 3060"): "incompatible",
        }
        attrs["compatibilidad"] = compatibility_levels[
            (attrs["visor"], attrs["gpu"])
        ]
        return attrs


class RealidadVirtualSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealidadVirtual
        fields = ['id', 'title', 'description', 'price', 'stock', 'image_url', 'subgenre']