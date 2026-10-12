from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeportesGameViewSet

router = DefaultRouter()
router.register(r'deportes', DeportesGameViewSet, basename='deportes')

urlpatterns = [
    path('', include(router.urls)),
]