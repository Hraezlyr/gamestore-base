from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FightingViewSet

router = DefaultRouter()
router.register(r'', FightingViewSet, basename='fighting')

urlpatterns = [
    path('', include(router.urls)),
]