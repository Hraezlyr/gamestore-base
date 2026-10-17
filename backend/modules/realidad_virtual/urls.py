from rest_framework.routers import DefaultRouter
from .views import RealidadVirtualViewSet

router = DefaultRouter()
router.register(r'realidad_virtual', RealidadVirtualViewSet, basename='realidad_virtual')

urlpatterns = router.urls