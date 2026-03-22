from django.urls import path

from .views import (
    CategoryListView,
    GroceryListListCreateView,
    GroceryListDetailView,
    GroceryItemListCreateView,
    GroceryItemDetailView,
    toggle_item_purchased,
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('lists/', GroceryListListCreateView.as_view(), name='grocery-list-list'),
    path('lists/<int:pk>/', GroceryListDetailView.as_view(), name='grocery-list-detail'),
    path('lists/<int:list_id>/items/', GroceryItemListCreateView.as_view(), name='grocery-item-list'),
    path('items/<int:pk>/', GroceryItemDetailView.as_view(), name='grocery-item-detail'),
    path('items/<int:pk>/toggle/', toggle_item_purchased, name='grocery-item-toggle'),
]
