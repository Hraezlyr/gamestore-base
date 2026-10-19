from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import HorrorGameViewSet

router = DefaultRouter()
router.register(r'horror', HorrorGameViewSet, basename='horror')

urlpatterns = [
    path('', include(router.urls)),
]
