from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ModuloAsignadoGameViewSet

router = DefaultRouter()
router.register(r'simulacion_construccion', ModuloAsignadoGameViewSet, basename='simulacion_construccion')

urlpatterns = [
    path('', include(router.urls)),
]