from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import moduloRPGs
from .serializers import ATTRIBUTES, BuildCalculatorSerializer, moduloRPGsSerializer


class moduloRPGsViewSet(viewsets.ModelViewSet):
    queryset = moduloRPGs.objects.all().order_by('-created_at')
    serializer_class = moduloRPGsSerializer

    @action(detail=True, methods=['post'], url_path='build-calculator')
    def build_calculator(self, request, pk=None):
        game = self.get_object()
        serializer = BuildCalculatorSerializer(data=request.data, context={'game': game})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        return Response(
            {
                'game_id': game.id,
                'target_level': data['target_level'],
                'total_points': data['total_points'],
                'spent_points': data['spent_points'],
                'remaining_points': data['total_points'] - data['spent_points'],
                'distribution': {name: data[name] for name in ATTRIBUTES},
            },
            status=status.HTTP_200_OK,
        )