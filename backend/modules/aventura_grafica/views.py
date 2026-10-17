from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import AventuraGraficaGame
from .serializers import AventuraGraficaGameSerializer

class AventuraGraficaGameViewSet(viewsets.ModelViewSet):
    queryset = AventuraGraficaGame.objects.all().order_by('-created_at')
    serializer_class = AventuraGraficaGameSerializer

    @action(detail=True, methods=['post'])
    def log_progress(self, request, pk=None):
        adventure = self.get_object()
        chapter = request.data.get('chapter')

        if chapter is None:
            return Response({"error": "El campo chapter es requerido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            chapter_int = int(chapter)
            if chapter_int > adventure.total_chapters or chapter_int < 0:
                return Response({"error": "Capítulo superior al total disponible o inválido."}, status=status.HTTP_400_BAD_REQUEST)
            
            adventure.update_progress(chapter_int)
            return Response({
                "message": "Progreso actualizado con éxito",
                "current_chapter": adventure.current_chapter,
                "progress_percentage": adventure.progress_percentage
            }, status=status.HTTP_200_OK)
        except (ValueError, TypeError):
            return Response({"error": "Datos inválidos para el capítulo."}, status=status.HTTP_400_BAD_REQUEST)