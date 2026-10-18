from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import RealidadVirtual
from .serializers import (
    HardwareCompatibilityRequestSerializer,
    RealidadVirtualSerializer,
)


class RealidadVirtualViewSet(viewsets.ModelViewSet):
    queryset = RealidadVirtual.objects.all().order_by('-created_at')
    serializer_class = RealidadVirtualSerializer

    # Validar compatibilidad de hardware
    @action(detail=True, methods=["post"], url_path="check-hardware")
    def check_hardware(self, request, pk=None):
        game = self.get_object()
        serializer = HardwareCompatibilityRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        visor = serializer.validated_data["visor"]
        gpu = serializer.validated_data["gpu"]
        compatibility = serializer.validated_data["compatibilidad"]
        is_compatible = compatibility != "incompatible"
        return Response(
            {
                "id": game.pk,
                "title": game.title,
                "visor": visor,
                "gpu": gpu,
                "compatible": is_compatible,
                "compatibilidad": compatibility,
                "simulada": True,
                "detalles": (
                    f"Resultado simulado: el equipo es "
                    f"{'compatible' if is_compatible else 'incompatible'} con "
                    f"{game.title} para la combinación de visor {visor} y GPU {gpu}."
                ),
            },
            status=status.HTTP_200_OK,
        )
