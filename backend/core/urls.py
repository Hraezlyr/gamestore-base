from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from django.urls import path, include

@api_view(['GET'])
def health_check(request):
    try:
        connection.ensure_connection()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return Response({
        "status": "online",
        "service": "GameStore API",
        "database": db_status
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', health_check),
    path('api/v1/',include('modules.perifericos.urls')),
    path('api/v1/', include('modules.realidad_virtual.urls')),
    path('api/v1/juegos_indie/', include('modules.juegos_indie.urls')),
    path("api/v1/", include("modules.shooter.urls")),
    path('api/v1/', include('modules.multijugador.urls')),
    path('api/v1/', include('modules.aventura_grafica.urls')),
  path('api/v1/', include('modules.simulacion_construccion.urls')),
]
