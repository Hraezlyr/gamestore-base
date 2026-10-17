from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JuegoIndieViewSet

router = DefaultRouter()
router.register(r'', JuegoIndieViewSet, basename='juegos_indie')

urlpatterns = [
    path('', include(router.urls)),
]