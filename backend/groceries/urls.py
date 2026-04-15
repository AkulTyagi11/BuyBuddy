from django.urls import path

from .views import (
    CategoryListView,
    GroceryListListCreateView,
    GroceryListDetailView,
    GroceryItemListCreateView,
    GroceryItemDetailView,
    toggle_item_purchased,
    PantryDetailView,
    PantryItemListCreateView,
    PantryItemDetailView,
    pantry_item_mark_low,
    pantry_item_to_list,
    pantry_expiring_items,
    voice_process,
    voice_session_confirm,
    VoiceSessionListView,
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('lists/', GroceryListListCreateView.as_view(), name='grocery-list-list'),
    path('lists/<int:pk>/', GroceryListDetailView.as_view(), name='grocery-list-detail'),
    path('lists/<int:list_id>/items/', GroceryItemListCreateView.as_view(), name='grocery-item-list'),
    path('items/<int:pk>/', GroceryItemDetailView.as_view(), name='grocery-item-detail'),
    path('items/<int:pk>/toggle/', toggle_item_purchased, name='grocery-item-toggle'),
    path('pantry/', PantryDetailView.as_view(), name='pantry-detail'),
    path('pantry/items/', PantryItemListCreateView.as_view(), name='pantry-item-list'),
    path('pantry/items/<int:pk>/', PantryItemDetailView.as_view(), name='pantry-item-detail'),
    path('pantry/items/<int:pk>/mark-low/', pantry_item_mark_low, name='pantry-item-mark-low'),
    path('pantry/items/<int:pk>/to-list/', pantry_item_to_list, name='pantry-item-to-list'),
    path('pantry/expiring/', pantry_expiring_items, name='pantry-expiring-items'),
    path('voice/process/', voice_process, name='voice-process'),
    path('voice/sessions/', VoiceSessionListView.as_view(), name='voice-session-list'),
    path('voice/sessions/<int:pk>/confirm/', voice_session_confirm, name='voice-session-confirm'),
]
