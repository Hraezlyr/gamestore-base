from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RetroGameViewSet

router = DefaultRouter()
router.register(r'retro', RetroGameViewSet, basename='retro')

urlpatterns = [
    path('', include(router.urls)),
]