from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AventuraGraficaGameViewSet

router = DefaultRouter()
router.register(r'aventura_grafica', AventuraGraficaGameViewSet, basename='aventura_grafica')

urlpatterns = [
    path('', include(router.urls)),
]