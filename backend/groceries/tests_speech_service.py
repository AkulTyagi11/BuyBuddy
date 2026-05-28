from django.test import TestCase

from .models import Category
from .services.speech_service import parse_grocery_items


class SpeechServiceParserTests(TestCase):
    def setUp(self):
        self.vegetables = Category.objects.create(name='Vegetables')
        self.dairy = Category.objects.create(name='Dairy')
        self.grains = Category.objects.create(name='Grains')
        self.snacks = Category.objects.create(name='Snacks')

    def test_parse_multiple_items_with_quantities_units_and_category_detection(self):
        result = parse_grocery_items('2 kg of tomatoes and 1 l milk', Category.objects.all())

        self.assertEqual(len(result), 2)

        self.assertEqual(result[0]['name'], 'Tomatoes')
        self.assertEqual(result[0]['quantity'], 2.0)
        self.assertEqual(result[0]['unit'], 'kg')
        self.assertEqual(result[0]['category'], self.vegetables.id)

        self.assertEqual(result[1]['name'], 'Milk')
        self.assertEqual(result[1]['quantity'], 1.0)
        self.assertEqual(result[1]['unit'], 'l')
        self.assertEqual(result[1]['category'], self.dairy.id)

    def test_parse_defaults_quantity_and_unit_when_not_provided(self):
        result = parse_grocery_items('bread, eggs', Category.objects.all())

        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]['name'], 'Bread')
        self.assertEqual(result[0]['quantity'], 1)
        self.assertEqual(result[0]['unit'], 'pcs')
        self.assertEqual(result[0]['category'], self.grains.id)

        self.assertEqual(result[1]['name'], 'Eggs')
        self.assertEqual(result[1]['quantity'], 1)
        self.assertEqual(result[1]['unit'], 'pcs')
        self.assertIsNone(result[1]['category'])

    def test_parse_alias_units_and_mixed_separators(self):
        result = parse_grocery_items('3 packets chips and 2 pieces onion', Category.objects.all())

        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]['name'], 'Chips')
        self.assertEqual(result[0]['quantity'], 3.0)
        self.assertEqual(result[0]['unit'], 'pack')

        self.assertEqual(result[1]['name'], 'Onion')
        self.assertEqual(result[1]['quantity'], 2.0)
        self.assertEqual(result[1]['unit'], 'pcs')
        self.assertEqual(result[1]['category'], self.vegetables.id)

    def test_parse_uses_category_name_substring_when_keyword_mapping_does_not_match(self):
        result = parse_grocery_items('snacks combo', Category.objects.all())

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['name'], 'Snacks Combo')
        self.assertEqual(result[0]['category'], self.snacks.id)

    def test_parse_returns_empty_list_for_blank_or_none_transcript(self):
        self.assertEqual(parse_grocery_items('', Category.objects.all()), [])
        self.assertEqual(parse_grocery_items(None, Category.objects.all()), [])
