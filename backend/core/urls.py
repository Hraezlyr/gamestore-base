from django.contrib import admin
from django.urls import path
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection

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
]