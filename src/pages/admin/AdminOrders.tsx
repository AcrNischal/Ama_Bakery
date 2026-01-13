import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, Eye, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { getOrders, updateOrder } from "@/services/dataService";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  menu_item: number;
  menu_item_name: string;
  price: number;
  quantity: number;
  notes: string;
}

interface Order {
  id: number;
  table: number;
  table_number: number;
  waiter: number;
  waiter_name: string;
  status: 'new' | 'ready' | 'completed' | 'cancelled';
  total: string | number;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  group_name: string;
  created_at: string;
  items: OrderItem[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      const updated = await updateOrder(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = String(order.id).includes(searchTerm) ||
      order.waiter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(order.table_number).includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">View and manage all orders</p>
        </div>
        <Button variant="outline" onClick={fetchOrders}>
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, Waiter, or Table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="card-elevated overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Loading orders...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Order ID</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Table</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Waiter</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Items</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Time</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">Payment</th>
                  <th className="px-6 py-4 text-right font-medium text-muted-foreground">Amount</th>
                  <th className="px-6 py-4 text-center font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium">#{order.id}</td>
                    <td className="px-6 py-4">
                      Table {order.table_number}
                      <span className="ml-2 text-xs bg-secondary px-2 py-0.5 rounded-full">
                        {order.group_name || 'Group A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{order.waiter_name}</td>
                    <td className="px-6 py-4">{order.items.length} items</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {format(parseISO(order.created_at), 'MMM d, h:mm a')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status as any} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.payment_status as any} />
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">₹{order.total}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select onValueChange={(val: Order['status']) => handleUpdateStatus(order.id, val)}>
                          <SelectTrigger className="h-8 w-8 p-0 border-none bg-transparent hover:bg-slate-100 flex items-center justify-center">
                            <Filter className="h-3 w-3" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No orders found matching your criteria
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Table</p>
                  <p className="font-medium">Table {selectedOrder.table_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Waiter</p>
                  <p className="font-medium">{selectedOrder.waiter_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={selectedOrder.status as any} />
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Status</p>
                  <StatusBadge status={selectedOrder.payment_status as any} />
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div className="flex flex-col">
                        <span>{item.quantity}× {item.menu_item_name}</span>
                        {item.notes && <span className="text-xs text-muted-foreground italic">Note: {item.notes}</span>}
                      </div>
                      <span className="font-medium">₹{Number(item.price) * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">₹{selectedOrder.total}</span>
              </div>

              <div className="flex gap-2 pt-2">
                {selectedOrder.status === 'new' && (
                  <Button className="flex-1" onClick={() => handleUpdateStatus(selectedOrder.id, 'ready')}>
                    <Clock className="h-4 w-4 mr-2" /> Mark Ready
                  </Button>
                )}
                {selectedOrder.status === 'ready' && (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Mark Completed
                  </Button>
                )}
                {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                  <Button variant="destructive" onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}>
                    <XCircle className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
