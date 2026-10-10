from rest_framework import viewsets
from .models import JuegosIndieGame
from .serializers import JuegosIndieGameSerializer

class JuegosIndieGameViewSet(viewsets.ModelViewSet):
    queryset = JuegosIndieGame.objects.all().order_by('-created_at')
    serializer_class = JuegosIndieGameSerializer