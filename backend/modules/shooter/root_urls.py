"""URL configuration used only by the isolated shooter test settings."""

from django.urls import include, path

urlpatterns = [path("api/v1/", include("modules.shooter.urls"))]
