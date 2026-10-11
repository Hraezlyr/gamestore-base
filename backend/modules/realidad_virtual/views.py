from rest_framework import viewsets
from .models import RealidadVirtual
from .serializers import RealidadVirtualSerializer


class RealidadVirtualViewSet(viewsets.ModelViewSet):
    queryset = RealidadVirtual.objects.all().order_by('-created_at')
    serializer_class = RealidadVirtualSerializer