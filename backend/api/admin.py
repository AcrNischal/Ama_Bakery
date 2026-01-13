from django.contrib import admin
from .models import User, Category, MenuItem, Table, Order, OrderItem, Transaction

admin.site.register(User)
admin.site.register(Category)
admin.site.register(MenuItem)
admin.site.register(Table)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Transaction)
