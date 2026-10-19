from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import FightingCharacter, Move
from .serializers import FightingCharacterSerializer, MoveSerializer


class FightingViewSet(viewsets.ModelViewSet):
    queryset = FightingCharacter.objects.all()
    serializer_class = FightingCharacterSerializer

    @action(detail=True, methods=['get'], url_path='move-list')
    def move_list(self, request, pk=None):
        """
        Retorna la lista de comandos de un personaje filtrada por categoría de ataque.
        Endpoint: GET /api/v1/fighting/{id}/move-list/?category=Normal
        """
        character = get_object_or_404(FightingCharacter, pk=pk)
        category_param = request.query_params.get('category', None)

        valid_categories = ['Normal', 'Especial', 'Super']

        moves = Move.objects.filter(character=character)

        if category_param:
            if category_param not in valid_categories:
                return Response(
                    {"error": f"Categoría '{category_param}' no válida. Opciones: Normal, Especial, Super."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            moves = moves.filter(category=category_param)

        serializer = MoveSerializer(moves, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)