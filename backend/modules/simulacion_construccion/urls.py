from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SimulationGameViewSet

router = DefaultRouter()
router.register(r'simulacion_construccion', SimulationGameViewSet, basename='simulacion_construccion')

urlpatterns = [
    path('', include(router.urls)),
]