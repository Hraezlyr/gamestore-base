from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PerifericosGameViewSet

router = DefaultRouter()
router.register(
	'perifericos',
	PerifericosGameViewSet,
	basename='perifericos'
)

urlpatterns = [
	path('', include(router.urls)),
]
