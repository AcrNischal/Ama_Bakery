from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('waiter', 'Waiter'),
        ('kitchen', 'Kitchen'),
        ('supervisor', 'Supervisor'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='waiter')

    def __str__(self):
        return self.username

class Category(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.name

class MenuItem(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, related_name='items', on_delete=models.CASCADE)
    available = models.BooleanField(default=True)
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True)

    def __str__(self):
        return self.name

class Table(models.Model):
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('order-in-progress', 'Order in Progress'),
        ('payment-pending', 'Payment Pending'),
    )
    number = models.IntegerField(unique=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='available')
    capacity = models.IntegerField(default=4)

    def __str__(self):
        return f"Table {self.number}"

class Order(models.Model):
    STATUS_CHOICES = (
        ('new', 'New'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('completed', 'Completed'),
    )
    table = models.ForeignKey(Table, related_name='orders', on_delete=models.CASCADE)
    waiter = models.ForeignKey(User, related_name='orders', on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=20, choices=(('pending', 'Pending'), ('paid', 'Paid')), default='pending')
    group_name = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Order {self.id} - Table {self.table.number}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name}"

class Transaction(models.Model):
    METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('online', 'Online/QR'),
    )
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transaction for Order {self.order.id}"
