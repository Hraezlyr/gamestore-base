from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from shooter.pagination import ShooterCatalogPagination
from shooter.selectors import public_catalog, public_game_details
from shooter.serializers import (
    ShooterGameDetailSerializer,
    ShooterGameListSerializer,
)


class ShooterGameListView(ListAPIView):
    serializer_class = ShooterGameListSerializer
    pagination_class = ShooterCatalogPagination
    permission_classes = [AllowAny]

    def get_queryset(self):
        return public_catalog()

class ShooterGameDetailView(RetrieveAPIView):
    serializer_class = ShooterGameDetailSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return public_game_details()