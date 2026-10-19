from rest_framework.routers import SimpleRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import include, path

from .views import (
    RatingAccountView,
    RegistrationView,
    ShooterGameAdminDetailView,
    ShooterGameAdminListView,
    ShooterGameDetailView,
    ShooterGameListView,
    ShooterRatingViewSet,
)

app_name = "shooter"
router = SimpleRouter()
router.register("", ShooterRatingViewSet, basename="game")
module_patterns = [
    path("games/", ShooterGameListView.as_view(), name="game-list"),
    path("games/<int:pk>/", ShooterGameDetailView.as_view(), name="game-detail"),
    path("admin/games/", ShooterGameAdminListView.as_view(), name="admin-game-list"),
    path("admin/games/<int:pk>/", ShooterGameAdminDetailView.as_view(), name="admin-game-detail"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token-obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("account/", RatingAccountView.as_view(), name="account"),
    path("register/", RegistrationView.as_view(), name="register"),
    *router.urls,
]

urlpatterns = [
    path("shooter/", include(module_patterns)),
]
