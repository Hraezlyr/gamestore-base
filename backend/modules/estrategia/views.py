from rest_framework import viewsets

from .models import EstrategiaGame
from .serializers import EstrategiaGameSerializer


class EstrategiaGameViewSet(viewsets.ModelViewSet):
    """CRUD completo: GET (lista/detalle), POST, PUT/PATCH y DELETE."""

    queryset = EstrategiaGame.objects.all().order_by('-created_at')
    serializer_class = EstrategiaGameSerializer
