from django.db import IntegrityError, transaction
from django.db.models import Avg, Count
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from modules.shooter.api.pagination import ReviewPagination, ShooterCatalogPagination
from modules.shooter.selectors import public_catalog, public_game_details
from modules.shooter.models import GameRating, ShooterGame
from modules.shooter.serializers import (
    ShooterGameAdminSerializer,
    ShooterGameDetailSerializer,
    ShooterGameListSerializer,
    GameRatingSerializer,
    PublicReviewSerializer,
    RegistrationSerializer,
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


def rating_summary(game_id):
    return GameRating.objects.filter(game_id=game_id).aggregate(
        rating_average=Avg("score"), rating_count=Count("id"),
    )


class ShooterRatingViewSet(viewsets.GenericViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]
    serializer_class = GameRatingSerializer

    def get_queryset(self):
        return public_catalog()

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return super().get_permissions()

    def summary(self, game_id):
        own_rating = None
        if self.request.user.is_authenticated:
            own_rating = GameRating.objects.filter(game_id=game_id, user=self.request.user).first()
        return {
            **rating_summary(game_id),
            "user_rating": GameRatingSerializer(own_rating).data if own_rating else None,
        }

    @action(detail=True, methods=["get"])
    def reviews(self, request, *args, **kwargs):
        game = self.get_object()
        reviews = GameRating.objects.filter(game=game).select_related("user")
        paginator = ReviewPagination()
        page = paginator.paginate_queryset(reviews, request)
        return paginator.get_paginated_response(PublicReviewSerializer(page, many=True).data)

    @action(detail=True, methods=["get", "post"])
    def rate(self, request, *args, **kwargs):
        game = self.get_object()
        if request.method == "GET":
            return Response(self.summary(game.pk))

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            locked_game = ShooterGame.objects.select_for_update().get(pk=game.pk)
            if GameRating.objects.filter(game=locked_game, user=request.user).exists():
                return Response({"detail": "Ya calificaste este juego."}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save(game=locked_game, user=request.user)
            summary = self.summary(locked_game.pk)
        return Response(
            {"rating": serializer.data, **summary},
            status=status.HTTP_201_CREATED,
        )


class RatingAccountView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"id": request.user.pk, "username": request.user.get_username()})


class RegistrationView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                user = serializer.save()
        except IntegrityError:
            return Response({"username": ["Este usuario ya existe."]}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"id": user.pk, "username": user.get_username()}, status=status.HTTP_201_CREATED)
