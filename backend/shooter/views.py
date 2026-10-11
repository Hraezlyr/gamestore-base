from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication

from shooter.pagination import ShooterCatalogPagination
from shooter.selectors import public_catalog, public_game_details
from shooter.models import ShooterGame
from shooter.serializers import (
    ShooterGameAdminSerializer,
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

class ShooterGameAdminListView(ListCreateAPIView):
    queryset = ShooterGame.objects.all()
    serializer_class = ShooterGameAdminSerializer
    pagination_class = ShooterCatalogPagination
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]


class ShooterGameAdminDetailView(RetrieveUpdateDestroyAPIView):
    queryset = ShooterGame.objects.all()
    serializer_class = ShooterGameAdminSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]