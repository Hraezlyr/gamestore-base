"""URLconf solo para pruebas: permite testear el módulo sin depender de core/urls.py."""
from django.urls import include, path

urlpatterns = [
    path('api/v1/', include('modules.giftcards.urls')),
]
