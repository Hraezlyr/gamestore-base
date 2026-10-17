from django.urls import path
from .views import JuegosIndieGameListCreateView

urlpatterns = [
    path('', JuegosIndieGameListCreateView.as_view(), name='juegos_indie_list'),
]