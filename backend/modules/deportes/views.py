from rest_framework import viewsets
from .models import DeportesGame
from .serializers import DeportesGameSerializer


class DeportesGameViewSet(viewsets.ModelViewSet):
    queryset = DeportesGame.objects.all().order_by('-created_at')
    serializer_class = DeportesGameSerializer