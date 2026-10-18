from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnuncioViewSet

router = DefaultRouter()
router.register(r'anuncios', AnuncioViewSet, basename='anuncio')

urlpatterns = [
    path('', include(router.urls)),
]