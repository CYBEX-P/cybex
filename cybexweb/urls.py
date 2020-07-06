from django.urls import path
from .views import GraphView, HomeView


urlpatterns = [
    path('graph', GraphView.as_view(), name='graph'),
    path('home', HomeView.as_view(), name='home'),
    path('', HomeView.as_view(), name='home'),
]
