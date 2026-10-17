from rest_framework import serializers
from .models import SimulationGame, SimulationDLC

class SimulationDLCSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationDLC
        fields = ['id', 'name', 'size_gb', 'is_installed']

class SimulationGameSerializer(serializers.ModelSerializer):
    dlcs = SimulationDLCSerializer(many=True, read_only=True)
    total_installed_size_gb = serializers.SerializerMethodField()

    class Meta:
        model = SimulationGame
        fields = ['id', 'title', 'description', 'price', 'stock', 'image_url', 'subgenre', 'dlcs', 'total_installed_size_gb']

    def get_total_installed_size_gb(self, obj):
        installed_dlcs = obj.dlcs.filter(is_installed=True)
        return sum(dlc.size_gb for dlc in installed_dlcs)