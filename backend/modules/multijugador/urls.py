from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ModuloAsignadoGameViewSet
router = DefaultRouter()
router.register(r'multijugador', ModuloAsignadoGameViewSet, basename='modulo_asignado')
urlpatterns = [
    path('', include(router.urls)),
]
