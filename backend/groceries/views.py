from django.db.models import Q
from datetime import date, timedelta
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import Category, GroceryList, GroceryItem, Pantry, PantryItem
from .serializers import (
    CategorySerializer,
    GroceryListSerializer,
    GroceryListSummarySerializer,
    GroceryItemSerializer,
    PantrySerializer,
    PantryItemSerializer,
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


class PantryDetailView(generics.RetrieveAPIView):
    serializer_class = PantrySerializer

    def get_object(self):
        pantry, _ = Pantry.objects.get_or_create(user=self.request.user)
        return pantry


class PantryItemListCreateView(generics.ListCreateAPIView):
    serializer_class = PantryItemSerializer

    def get_queryset(self):
        queryset = PantryItem.objects.filter(pantry__user=self.request.user)
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

    def perform_create(self, serializer):
        pantry, _ = Pantry.objects.get_or_create(user=self.request.user)
        serializer.save(pantry=pantry)


class PantryItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PantryItemSerializer

    def get_queryset(self):
        return PantryItem.objects.filter(pantry__user=self.request.user)


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


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def pantry_item_mark_low(request, pk):
    try:
        item = PantryItem.objects.get(pk=pk, pantry__user=request.user)
    except PantryItem.DoesNotExist:
        return Response({'detail': 'Pantry item not found.'}, status=status.HTTP_404_NOT_FOUND)

    item.condition = 'low'
    item.save(update_fields=['condition', 'updated_at'])
    return Response(PantryItemSerializer(item).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pantry_item_to_list(request, pk):
    try:
        item = PantryItem.objects.get(pk=pk, pantry__user=request.user)
    except PantryItem.DoesNotExist:
        return Response({'detail': 'Pantry item not found.'}, status=status.HTTP_404_NOT_FOUND)

    list_id = request.data.get('list_id')
    if not list_id:
        return Response({'detail': 'list_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    grocery_list = GroceryList.objects.filter(
        Q(owner=request.user) | Q(shared_with=request.user),
        pk=list_id,
    ).first()
    if not grocery_list:
        raise PermissionDenied('You do not have access to this list.')

    grocery_item = GroceryItem.objects.create(
        grocery_list=grocery_list,
        name=item.name,
        quantity=item.quantity,
        unit=item.unit,
        category=item.category,
    )
    return Response(
        {
            'status': 'added_to_list',
            'item': GroceryItemSerializer(grocery_item).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pantry_expiring_items(request):
    today = date.today()
    next_week = today + timedelta(days=7)
    items = PantryItem.objects.filter(
        pantry__user=request.user,
        expiry_date__gte=today,
        expiry_date__lte=next_week,
    )
    serializer = PantryItemSerializer(items, many=True)
    return Response(serializer.data)
