from django.urls import path

from .consumers import ListCollaborationConsumer

websocket_urlpatterns = [
    path('ws/lists/<int:list_id>/', ListCollaborationConsumer.as_asgi()),
]
