from django.contrib import admin
from .models import Category, GroceryList, GroceryItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')


@admin.register(GroceryList)
class GroceryListAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'owner', 'created_at', 'due_date', 'is_shared')
    list_filter = ('is_shared', 'created_at')


@admin.register(GroceryItem)
class GroceryItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'quantity', 'unit', 'is_purchased', 'grocery_list', 'category')
    list_filter = ('is_purchased', 'category')
