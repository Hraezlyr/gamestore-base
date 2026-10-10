from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JuegosIndieGameViewSet

router = DefaultRouter()
router.register(r'juegos_indie', JuegosIndieGameViewSet, basename='juegos_indie')

urlpatterns = [
    path('', include(router.urls)),
]