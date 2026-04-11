from django.contrib import admin
from .models import Category, GroceryList, GroceryItem, Pantry, PantryItem


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


@admin.register(Pantry)
class PantryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'created_at', 'updated_at')
    search_fields = ('user__username',)


@admin.register(PantryItem)
class PantryItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'quantity', 'unit', 'condition', 'pantry', 'category', 'expiry_date')
    list_filter = ('condition', 'category', 'unit')
    search_fields = ('name', 'pantry__user__username')
