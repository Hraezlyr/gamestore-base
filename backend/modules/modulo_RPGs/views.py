from rest_framework import viewsets
from .models import moduloRPGs
from .serializers import moduloRPGsSerializer


class moduloRPGsViewSet(viewsets.ModelViewSet):
    queryset = moduloRPGs.objects.all().order_by('-created_at')
    serializer_class = moduloRPGsSerializer
# Create your views here.

