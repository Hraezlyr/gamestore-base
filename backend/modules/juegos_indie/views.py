from rest_framework import generics
from .models import JuegoIndie
from .serializers import JuegoIndieSerializer

class JuegosIndieGameListCreateView(generics.ListCreateAPIView):
    queryset = JuegoIndie.objects.all()
    serializer_class = JuegoIndieSerializer