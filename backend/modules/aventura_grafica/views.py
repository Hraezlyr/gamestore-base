from rest_framework import viewsets
from .models import AventuraGraficaGame
from .serializers import AventuraGraficaGameSerializer

class AventuraGraficaGameViewSet(viewsets.ModelViewSet):
    queryset = AventuraGraficaGame.objects.all().order_by('-created_at')
    serializer_class = AventuraGraficaGameSerializer
