from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class GroceryList(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='grocery_lists',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateField(null=True, blank=True)
    is_shared = models.BooleanField(default=False)
    shared_with = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='shared_lists',
        blank=True,
    )

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.name


class GroceryItem(models.Model):
    UNIT_CHOICES = [
        ('pcs', 'Pieces'),
        ('kg', 'Kilograms'),
        ('g', 'Grams'),
        ('l', 'Liters'),
        ('ml', 'Milliliters'),
        ('dozen', 'Dozen'),
        ('pack', 'Pack'),
        ('bottle', 'Bottle'),
        ('can', 'Can'),
        ('bag', 'Bag'),
    ]

    name = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='pcs')
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_purchased = models.BooleanField(default=False)
    grocery_list = models.ForeignKey(
        GroceryList,
        on_delete=models.CASCADE,
        related_name='items',
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='items',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['is_purchased', 'name']

    def __str__(self):
        return self.name
