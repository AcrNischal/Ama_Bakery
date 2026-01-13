from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Category, MenuItem, Table

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with initial Ama Bakery POS data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # 1. Create Users
        users_data = [
            {'username': 'Rahul', 'role': 'waiter', 'pin': '1234'},
            {'username': 'Priya', 'role': 'waiter', 'pin': '2345'},
            {'username': 'Kitchen1', 'role': 'kitchen', 'pin': '3456'},
            {'username': 'Admin', 'role': 'admin', 'pin': '0000'},
        ]
        for u in users_data:
            if not User.objects.filter(username=u['username']).exists():
                user = User.objects.create_user(
                    username=u['username'],
                    password=u['pin'] # PIN used as password
                )
                user.role = u['role']
                user.save()
                self.stdout.write(f'Created user: {u["username"]}')

        # 2. Create Categories
        categories = ['Bakery', 'Coffee', 'Beverages', 'Snacks']
        cat_objs = {}
        for cat_name in categories:
            cat, created = Category.objects.get_or_create(name=cat_name)
            cat_objs[cat_name] = cat
            if created:
                self.stdout.write(f'Created category: {cat_name}')

        # 3. Create Menu Items
        menu_items = [
            # Bakery
            {'name': 'Croissant', 'price': 45, 'category': 'Bakery'},
            {'name': 'Chocolate Muffin', 'price': 55, 'category': 'Bakery'},
            {'name': 'Cinnamon Roll', 'price': 65, 'category': 'Bakery'},
            {'name': 'Blueberry Scone', 'price': 50, 'category': 'Bakery'},
            {'name': 'Danish Pastry', 'price': 60, 'category': 'Bakery'},
            # Coffee
            {'name': 'Espresso', 'price': 80, 'category': 'Coffee'},
            {'name': 'Americano', 'price': 100, 'category': 'Coffee'},
            {'name': 'Cappuccino', 'price': 120, 'category': 'Coffee'},
            {'name': 'Latte', 'price': 130, 'category': 'Coffee'},
            {'name': 'Mocha', 'price': 150, 'category': 'Coffee'},
            # Beverages
            {'name': 'Fresh Orange Juice', 'price': 90, 'category': 'Beverages'},
            {'name': 'Iced Tea', 'price': 60, 'category': 'Beverages'},
            {'name': 'Mango Smoothie', 'price': 120, 'category': 'Beverages'},
            # Snacks
            {'name': 'Veg Sandwich', 'price': 120, 'category': 'Snacks'},
            {'name': 'Cheese Toast', 'price': 80, 'category': 'Snacks'},
            {'name': 'Paneer Wrap', 'price': 140, 'category': 'Snacks'},
            {'name': 'French Fries', 'price': 90, 'category': 'Snacks'},
        ]
        for item in menu_items:
            MenuItem.objects.get_or_create(
                name=item['name'],
                defaults={'price': item['price'], 'category': cat_objs[item['category']]}
            )
            self.stdout.write(f'Synced menu item: {item["name"]}')

        # 4. Create Tables
        for i in range(1, 13):
            Table.objects.get_or_create(
                number=i,
                defaults={'capacity': 4 if i % 2 == 0 else 2}
            )
            self.stdout.write(f'Synced table {i}')

        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))
