from django.core.management.base import BaseCommand
from groceries.models import Category


class Command(BaseCommand):
    help = 'Seed default grocery categories'

    def handle(self, *args, **options):
        categories = [
            'Vegetables',
            'Fruits',
            'Dairy',
            'Meat',
            'Snacks',
            'Beverages',
            'Bakery',
            'Frozen',
            'Household',
            'Others',
        ]
        created = 0
        for name in categories:
            _, was_created = Category.objects.get_or_create(name=name)
            if was_created:
                created += 1
        self.stdout.write(self.style.SUCCESS(f'Seeded {created} new categories (total: {len(categories)})'))
