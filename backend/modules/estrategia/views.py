import unicodedata

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import EstrategiaGame, Faction
from .serializers import EstrategiaGameSerializer, FactionSerializer


def _normalize(value):
    """Minúsculas y sin tildes: 'Económico' -> 'economico'."""
    text = unicodedata.normalize('NFKD', value.strip().lower())
    return ''.join(ch for ch in text if not unicodedata.combining(ch))


# 'ofensivo' -> 'ofensivo', 'economico' -> 'economico' (acepta etiqueta o valor)
STYLE_LOOKUP = {
    _normalize(label): value for value, label in Faction.PlayStyle.choices
}
STYLE_LABELS = [label for _, label in Faction.PlayStyle.choices]


class EstrategiaGameViewSet(viewsets.ModelViewSet):
    """CRUD completo: GET (lista/detalle), POST, PUT/PATCH y DELETE."""

    queryset = EstrategiaGame.objects.all().order_by('-created_at')
    serializer_class = EstrategiaGameSerializer

    @action(detail=True, methods=['get'], url_path='factions')
    def factions(self, request, pk=None):
        """GET /api/v1/estrategia/{id}/factions/?style=Ofensivo|Defensivo|Económico

        - 200: lista de facciones (todas, o filtradas por estilo de juego).
        - 400: el parámetro `style` no es un estilo válido.
        - 404: el juego no existe.
        """
        game = self.get_object()  # lanza 404 si el id no existe
        factions = game.factions.all()

        style_param = request.query_params.get('style', '').strip()
        style = None
        if style_param:
            style = STYLE_LOOKUP.get(_normalize(style_param))
            if style is None:
                return Response(
                    {'style': [f"Estilo no válido. Usa: {', '.join(STYLE_LABELS)}."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            factions = factions.filter(play_style=style)

        data = FactionSerializer(factions, many=True).data
        return Response(
            {
                'game': game.pk,
                'style': style,
                'count': len(data),
                'factions': data,
            },
            status=status.HTTP_200_OK,
        )
