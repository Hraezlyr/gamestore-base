from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Anuncio
from .serializers import AnuncioSerializer

class AnuncioViewSet(viewsets.ModelViewSet):
    queryset = Anuncio.objects.all()
    serializer_class = AnuncioSerializer

    @action(detail=True, methods=['post'], url_path='votar')
    def votar(self, request, pk=None):
        anuncio = self.get_object()
        anuncio.votos_interes += 1
        anuncio.save()
        return Response(
            {
                'status': 'voto registrado',
                'votos_interes': anuncio.votos_interes
            },
            status=status.HTTP_200_OK
        )