from django.urls import path

from shooter.views import ShooterGameDetailView, ShooterGameListView


app_name = "shooter"

urlpatterns = [
    path("games/", ShooterGameListView.as_view(), name="game-list"),
    path(
        "games/<int:pk>/",
        ShooterGameDetailView.as_view(),
        name="game-detail",
    ),
]