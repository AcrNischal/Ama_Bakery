from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Category, MenuItem, Table, Order, OrderItem, Transaction

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['role'] = self.user.role
        data['id'] = self.user.id
        return data

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'price', 'category', 'category_name', 'available', 'image']

class CategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'items']

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'number', 'status', 'capacity']

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.ReadOnlyField(source='menu_item.name')
    price = serializers.ReadOnlyField(source='menu_item.price')
    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'price', 'quantity', 'notes']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    waiter_name = serializers.ReadOnlyField(source='waiter.username')
    table_number = serializers.ReadOnlyField(source='table.number')
    
    class Meta:
        model = Order
        fields = ['id', 'table', 'table_number', 'waiter', 'waiter_name', 'status', 'total', 'created_at', 'payment_status', 'group_name', 'items']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'order', 'amount', 'method', 'timestamp']
