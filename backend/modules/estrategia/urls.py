from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import EstrategiaGameViewSet

router = DefaultRouter()
router.register(r'estrategia', EstrategiaGameViewSet, basename='estrategia')

urlpatterns = [
    path('', include(router.urls)),
]
