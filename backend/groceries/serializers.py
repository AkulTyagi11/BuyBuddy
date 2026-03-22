from rest_framework import serializers
from django.contrib.auth.models import User

from .models import Category, GroceryList, GroceryItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name')


class GroceryItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = GroceryItem
        fields = (
            'id', 'name', 'quantity', 'unit', 'price',
            'is_purchased', 'grocery_list', 'category', 'category_name', 'created_at',
        )
        read_only_fields = ('created_at',)


class GroceryListSerializer(serializers.ModelSerializer):
    items = GroceryItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()
    purchased_count = serializers.SerializerMethodField()
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = GroceryList
        fields = (
            'id', 'name', 'owner', 'owner_username', 'created_at', 'updated_at',
            'due_date', 'is_shared', 'shared_with', 'items', 'item_count', 'purchased_count',
        )
        read_only_fields = ('owner', 'created_at', 'updated_at')

    def get_item_count(self, obj):
        return obj.items.count()

    def get_purchased_count(self, obj):
        return obj.items.filter(is_purchased=True).count()


class GroceryListSummarySerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()
    purchased_count = serializers.SerializerMethodField()
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = GroceryList
        fields = (
            'id', 'name', 'owner', 'owner_username', 'created_at', 'updated_at',
            'due_date', 'is_shared', 'item_count', 'purchased_count',
        )
        read_only_fields = ('owner', 'created_at', 'updated_at')

    def get_item_count(self, obj):
        return obj.items.count()

    def get_purchased_count(self, obj):
        return obj.items.filter(is_purchased=True).count()
