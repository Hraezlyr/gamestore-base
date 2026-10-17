from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SimulationGame, SimulationDLC
from .serializers import SimulationGameSerializer

class SimulationGameViewSet(viewsets.ModelViewSet):
    queryset = SimulationGame.objects.all().order_by('-created_at')
    serializer_class = SimulationGameSerializer

    @action(detail=True, methods=['post'], url_path='toggle-dlc')
    def toggle_dlc(self, request, pk=None):
        game = self.get_object()
        dlc_id = request.data.get('dlc_id')

        if not dlc_id:
            return Response(
                {"error": "El campo 'dlc_id' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            dlc = game.dlcs.get(id=dlc_id)
        except SimulationDLC.DoesNotExist:
            return Response(
                {"error": "El DLC especificado no existe para este juego."},
                status=status.HTTP_404_NOT_FOUND
            )

        dlc.is_installed = not dlc.is_installed
        dlc.save()

        serializer = self.get_serializer(game)
        return Response(serializer.data, status=status.HTTP_200_OK)