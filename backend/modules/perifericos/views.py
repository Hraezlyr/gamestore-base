from rest_framework import viewsets
from .models import PerifericosGame
from .serializers import PerifericosGameSerializer

class PerifericosGameViewSet(viewsets.ModelViewSet):
    queryset = PerifericosGame.objects.all().order_by('-created_at')
    serializer_class = PerifericosGameSerializer
