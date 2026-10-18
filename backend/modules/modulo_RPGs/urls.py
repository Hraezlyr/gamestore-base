
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import moduloRPGsViewSet

router = DefaultRouter()
router.register(r'rpg', moduloRPGsViewSet, basename='rpg')

urlpatterns = [
    path('', include(router.urls)),
]
