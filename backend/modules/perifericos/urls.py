from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PerifericosGameViewSet

router = DefaultRouter()
router.register(r'perifericos', PerifericosGameViewSet, basename='perifericos')

urlpatterns = [
    path('', include(router.urls)),
]
