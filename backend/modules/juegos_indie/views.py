from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import JuegoIndie
from .serializers import JuegoIndieSerializer, SupportDevSerializer

class JuegoIndieViewSet(viewsets.ModelViewSet):
    queryset = JuegoIndie.objects.all()
    serializer_class = JuegoIndieSerializer

    @action(detail=True, methods=['post'], url_path='support-dev')
    def support_dev(self, request, pk=None):
        juego = self.get_object()
        serializer = SupportDevSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Incrementar el contador de boosts
        juego.boosts += 1
        juego.save()
        
        comment = serializer.validated_data.get('comment', '')
        
        return Response({
            "message": "¡Apoyo registrado con éxito!",
            "boosts": juego.boosts,
            "comment_received": comment
        }, status=status.HTTP_200_OK)