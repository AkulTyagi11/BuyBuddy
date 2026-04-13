from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, GroceryItem, GroceryList, Pantry, PantryItem


User = get_user_model()


class PantryApiTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(username='owner', password='pass12345')
		self.other_user = User.objects.create_user(username='other', password='pass12345')

		self.category = Category.objects.create(name='Vegetables')
		self.other_category = Category.objects.create(name='Dairy')

		self.own_list = GroceryList.objects.create(name='Weekly', owner=self.user)
		self.other_list = GroceryList.objects.create(name='Private', owner=self.other_user)

		self.client.force_authenticate(user=self.user)

	def _create_pantry_item(self, **kwargs):
		pantry, _ = Pantry.objects.get_or_create(user=self.user)
		defaults = {
			'name': 'Tomatoes',
			'quantity': 2,
			'unit': 'kg',
			'category': self.category,
			'condition': 'stock',
		}
		defaults.update(kwargs)
		return PantryItem.objects.create(pantry=pantry, **defaults)

	def test_get_pantry_creates_pantry_for_authenticated_user(self):
		self.assertFalse(Pantry.objects.filter(user=self.user).exists())

		response = self.client.get(reverse('pantry-detail'))

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(Pantry.objects.filter(user=self.user).exists())
		self.assertEqual(response.data['user'], self.user.id)

	def test_create_and_list_pantry_items_returns_only_current_user_items(self):
		response = self.client.post(
			reverse('pantry-item-list'),
			{
				'name': 'Milk',
				'quantity': '1.00',
				'unit': 'l',
				'category': self.category.id,
				'condition': 'stock',
				'notes': 'Whole milk',
			},
			format='json',
		)
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)

		other_pantry, _ = Pantry.objects.get_or_create(user=self.other_user)
		PantryItem.objects.create(
			pantry=other_pantry,
			name='Secret item',
			quantity=1,
			unit='pcs',
			category=self.category,
		)

		list_response = self.client.get(reverse('pantry-item-list'))
		self.assertEqual(list_response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(list_response.data), 1)
		self.assertEqual(list_response.data[0]['name'], 'Milk')

	def test_list_pantry_items_can_filter_by_category(self):
		self._create_pantry_item(name='Tomatoes', category=self.category)
		self._create_pantry_item(name='Yogurt', category=self.other_category)

		response = self.client.get(reverse('pantry-item-list'), {'category': self.category.id})

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]['name'], 'Tomatoes')

	def test_update_and_delete_pantry_item(self):
		item = self._create_pantry_item(name='Rice', quantity=1)

		update_response = self.client.put(
			reverse('pantry-item-detail', kwargs={'pk': item.pk}),
			{
				'name': 'Brown Rice',
				'quantity': '3.00',
				'unit': 'kg',
				'category': self.category.id,
				'expiry_date': None,
				'condition': 'stock',
				'notes': 'Refill',
			},
			format='json',
		)
		self.assertEqual(update_response.status_code, status.HTTP_200_OK)
		item.refresh_from_db()
		self.assertEqual(item.name, 'Brown Rice')
		self.assertEqual(str(item.quantity), '3.00')

		delete_response = self.client.delete(reverse('pantry-item-detail', kwargs={'pk': item.pk}))
		self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
		self.assertFalse(PantryItem.objects.filter(pk=item.pk).exists())

	def test_mark_low_endpoint_sets_condition(self):
		item = self._create_pantry_item(condition='stock')

		response = self.client.patch(reverse('pantry-item-mark-low', kwargs={'pk': item.pk}))

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		item.refresh_from_db()
		self.assertEqual(item.condition, 'low')
		self.assertEqual(response.data['condition'], 'low')

	def test_add_to_list_creates_grocery_item_for_accessible_list(self):
		item = self._create_pantry_item(name='Onions', quantity=2, unit='kg')

		response = self.client.post(
			reverse('pantry-item-to-list', kwargs={'pk': item.pk}),
			{'list_id': self.own_list.id},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['status'], 'added_to_list')
		self.assertTrue(
			GroceryItem.objects.filter(grocery_list=self.own_list, name='Onions', unit='kg').exists()
		)

	def test_add_to_list_requires_list_id(self):
		item = self._create_pantry_item()

		response = self.client.post(
			reverse('pantry-item-to-list', kwargs={'pk': item.pk}),
			{},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(response.data['detail'], 'list_id is required.')

	def test_add_to_list_forbidden_for_inaccessible_list(self):
		item = self._create_pantry_item(name='Apples')

		response = self.client.post(
			reverse('pantry-item-to-list', kwargs={'pk': item.pk}),
			{'list_id': self.other_list.id},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
		self.assertFalse(GroceryItem.objects.filter(name='Apples', grocery_list=self.other_list).exists())

	def test_expiring_endpoint_returns_only_items_expiring_within_next_seven_days(self):
		today = date.today()
		self._create_pantry_item(name='Soon', expiry_date=today + timedelta(days=3))
		self._create_pantry_item(name='Today', expiry_date=today)
		self._create_pantry_item(name='Too Late', expiry_date=today + timedelta(days=10))
		self._create_pantry_item(name='Past', expiry_date=today - timedelta(days=1))
		self._create_pantry_item(name='No Date', expiry_date=None)

		other_pantry, _ = Pantry.objects.get_or_create(user=self.other_user)
		PantryItem.objects.create(
			pantry=other_pantry,
			name='Other user item',
			quantity=1,
			unit='pcs',
			expiry_date=today + timedelta(days=1),
		)

		response = self.client.get(reverse('pantry-expiring-items'))

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		returned_names = {item['name'] for item in response.data}
		self.assertSetEqual(returned_names, {'Soon', 'Today'})
