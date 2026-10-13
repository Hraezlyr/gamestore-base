from rest_framework import viewsets
from .models import ModuloAsignadoGame
from .serializers import ModuloAsignadoGameSerializer

class ModuloAsignadoGameViewSet(viewsets.ModelViewSet):
    queryset = ModuloAsignadoGame.objects.all().order_by('-created_at')
    serializer_class = ModuloAsignadoGameSerializer