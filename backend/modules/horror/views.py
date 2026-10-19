from rest_framework import viewsets

from .models import HorrorGame
from .serializers import HorrorGameSerializer


class HorrorGameViewSet(viewsets.ModelViewSet):
    queryset = HorrorGame.objects.all().order_by('-created_at')
    serializer_class = HorrorGameSerializer
