from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import RetroGame
from .serializers import RetroGameSerializer

class RetroGameViewSet(viewsets.ModelViewSet):
    queryset = RetroGame.objects.all()
    serializer_class = RetroGameSerializer

    @action(detail=True, methods=['post'], url_path='log-progress')
    def log_progress(self, request, pk=None):
        game = self.get_object()
        chapter = request.data.get('chapter')

        # Validación 1: Campo obligatorio
        if chapter is None:
            return Response(
                {"error": "El campo 'chapter' es obligatorio."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validación 2: Debe ser entero
        try:
            chapter = int(chapter)
        except (ValueError, TypeError):
            return Response(
                {"error": "El campo 'chapter' debe ser un número entero."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validación 3: Rango de capítulos válido
        if chapter < 0 or chapter > game.total_chapters:
            return Response(
                {"error": f"Capítulo inválido. Debe estar entre 0 y {game.total_chapters}."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Modificación de estado
        game.calculate_progress(chapter)

        return Response({
            "message": "Progreso actualizado correctamente",
            "current_chapter": game.current_chapter,
            "total_chapters": game.total_chapters,
            "progress_percentage": game.progress_percentage
        }, status=status.HTTP_200_OK)