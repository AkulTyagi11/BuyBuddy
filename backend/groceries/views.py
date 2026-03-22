from django.db.models import Q
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import Category, GroceryList, GroceryItem
from .serializers import (
    CategorySerializer,
    GroceryListSerializer,
    GroceryListSummarySerializer,
    GroceryItemSerializer,
)


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (AllowAny,)


class GroceryListListCreateView(generics.ListCreateAPIView):
    serializer_class = GroceryListSummarySerializer

    def get_queryset(self):
        return GroceryList.objects.filter(
            Q(owner=self.request.user) | Q(shared_with=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class GroceryListDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GroceryListSerializer

    def get_queryset(self):
        return GroceryList.objects.filter(
            Q(owner=self.request.user) | Q(shared_with=self.request.user)
        ).distinct()


class GroceryItemListCreateView(generics.ListCreateAPIView):
    serializer_class = GroceryItemSerializer

    def get_queryset(self):
        list_id = self.kwargs.get('list_id')
        return GroceryItem.objects.filter(
            grocery_list_id=list_id,
            grocery_list__in=GroceryList.objects.filter(
                Q(owner=self.request.user) | Q(shared_with=self.request.user)
            ),
        )

    def perform_create(self, serializer):
        list_id = self.kwargs.get('list_id')
        grocery_list = GroceryList.objects.filter(
            Q(owner=self.request.user) | Q(shared_with=self.request.user),
            pk=list_id,
        ).first()
        if not grocery_list:
            raise PermissionError('You do not have access to this list.')
        serializer.save(grocery_list=grocery_list)


class GroceryItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GroceryItemSerializer

    def get_queryset(self):
        return GroceryItem.objects.filter(
            grocery_list__in=GroceryList.objects.filter(
                Q(owner=self.request.user) | Q(shared_with=self.request.user)
            )
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def toggle_item_purchased(request, pk):
    try:
        item = GroceryItem.objects.get(
            pk=pk,
            grocery_list__in=GroceryList.objects.filter(
                Q(owner=request.user) | Q(shared_with=request.user)
            ),
        )
    except GroceryItem.DoesNotExist:
        return Response(
            {'detail': 'Item not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )
    item.is_purchased = not item.is_purchased
    item.save()
    return Response(GroceryItemSerializer(item).data)
