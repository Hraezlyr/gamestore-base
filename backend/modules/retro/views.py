from rest_framework import viewsets
from .models import RetroGame
from .serializers import RetroGameSerializer

class RetroGameViewSet(viewsets.ModelViewSet):
    queryset = RetroGame.objects.all().order_by('-created_at')
    serializer_class = RetroGameSerializer