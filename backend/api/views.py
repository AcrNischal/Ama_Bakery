from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Category, MenuItem, Table, Order, OrderItem, Transaction
from .serializers import (
    UserSerializer, CategorySerializer, MenuItemSerializer, 
    TableSerializer, OrderSerializer, OrderItemSerializer, TransactionSerializer,
    MyTokenObtainPairSerializer
)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer

class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all().order_by('number')
    serializer_class = TableSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

    def create(self, request, *args, **kwargs):
        items_data = request.data.get('items', [])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save(waiter=request.user if request.user.is_authenticated else None)
        
        for item_data in items_data:
            menu_item_id = item_data.get('menu_item')
            quantity = item_data.get('quantity', 1)
            notes = item_data.get('notes', '')
            menu_item = MenuItem.objects.get(id=menu_item_id)
            OrderItem.objects.create(order=order, menu_item=menu_item, quantity=quantity, notes=notes)
        
        # Update table status
        table = order.table
        table.status = 'occupied'
        table.save()
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()
        
        # Mark order as paid
        order = transaction.order
        order.payment_status = 'paid'
        order.status = 'completed'
        order.save()
        
        # Mark table as available
        table = order.table
        table.status = 'available'
        table.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
