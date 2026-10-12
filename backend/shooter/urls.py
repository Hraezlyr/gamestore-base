from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.urls import path

from shooter.views import (
    ShooterGameAdminDetailView,
    ShooterGameAdminListView,
    ShooterGameDetailView,
    ShooterGameListView,
)


app_name = "shooter"

urlpatterns = [
    path("games/", ShooterGameListView.as_view(), name="game-list"),
    path(
        "games/<int:pk>/",
        ShooterGameDetailView.as_view(),
        name="game-detail",
    ),
    path(
        "admin/games/",
        ShooterGameAdminListView.as_view(),
        name="admin-game-list",
    ),
    path(
        "admin/games/<int:pk>/",
        ShooterGameAdminDetailView.as_view(),
        name="admin-game-detail",
    ),
    path(
        "auth/token/",
        TokenObtainPairView.as_view(),
        name="token-obtain",
    ),
    path(
        "auth/token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),
]