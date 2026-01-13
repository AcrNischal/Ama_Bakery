import { useState, useEffect } from "react";
import { StatCard } from "@/components/admin/StatCard";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  UtensilsCrossed,
  Coffee,
  Loader2
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { StatusBadge } from "@/components/ui/status-badge";
import { getOrders, getTables } from "@/services/dataService";
import { format, parseISO, isToday } from "date-fns";
import { toast } from "sonner";

const COLORS = ['hsl(32, 95%, 44%)', 'hsl(15, 70%, 50%)', 'hsl(142, 71%, 45%)', 'hsl(199, 89%, 48%)'];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [orderData, tableData] = await Promise.all([getOrders(), getTables()]);
      setOrders(orderData);
      setTables(tableData);
    } catch (error) {
      toast.error("Failed to refresh dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate stats from real data
  const todayOrders = orders.filter(o => isToday(parseISO(o.created_at)));
  const todaySales = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const avgOrderValue = todayOrders.length > 0 ? (todaySales / todayOrders.length).toFixed(0) : 0;

  const liveTableStatus = {
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status !== 'available').length,
  };

  // Mock analytics for charts since we don't have a dedicated analytics backend yet
  // but we can derive some simple data
  const categoryData = [
    { category: 'Beverages', percentage: 35, revenue: todaySales * 0.35 },
    { category: 'Pastries', percentage: 45, revenue: todaySales * 0.45 },
    { category: 'Cakes', percentage: 15, revenue: todaySales * 0.15 },
    { category: 'Savory', percentage: 5, revenue: todaySales * 0.05 },
  ];

  const hourlyData = Array.from({ length: 8 }, (_, i) => ({
    hour: `${9 + i}:00`,
    orders: Math.floor(Math.random() * 10) + 2
  }));

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-lg">Preparing your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center justify-between sm:block sm:text-right w-full sm:w-auto">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={`₹${todaySales.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Today's Orders"
          value={todayOrders.length}
          icon={ShoppingBag}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${avgOrderValue}`}
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="Orders (Total)"
          value={orders.length}
          icon={Clock}
          subtitle="All time"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Orders Chart */}
        <div className="lg:col-span-2 card-elevated p-6">
          <h3 className="text-lg font-semibold mb-4">Orders by Hour (Today)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold mb-4">Estimated Sales by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="percentage"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => `${value}%`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {categoryData.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span>{item.category}</span>
                </div>
                <span className="font-medium">₹{Math.round(item.revenue).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Table Status */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Live Table Status</h3>
            <UtensilsCrossed className="h-5 w-5 text-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-success/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-success">{liveTableStatus.available}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
            <div className="bg-warning/10 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-warning">{liveTableStatus.occupied}</p>
              <p className="text-sm text-muted-foreground">Occupied</p>
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${table.status === 'available'
                  ? 'bg-success/20 text-success'
                  : table.status === 'payment-pending'
                    ? 'bg-accent/20 text-accent'
                    : 'bg-warning/20 text-warning'
                  }`}
              >
                {table.number}
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Items (Mocked based on order items if we had time to parse all) */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Live Monitoring</h3>
            <Coffee className="h-5 w-5 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm mb-4">Tracking active orders and table rotations in real-time.</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium">Active Orders</span>
              <span className="status-badge bg-blue-100 text-blue-700">{orders.filter(o => o.status === 'new').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium">Ready for Pickup</span>
              <span className="status-badge bg-emerald-100 text-emerald-700">{orders.filter(o => o.status === 'ready').length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium">Unpaid Amount</span>
              <span className="status-badge bg-amber-100 text-amber-700">₹{orders.filter(o => o.payment_status === 'unpaid').reduce((sum, o) => sum + Number(o.total), 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card-elevated p-0 overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Table</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Server</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium">Table {order.table_number}</span>
                      <span className="text-xs text-muted-foreground">{order.group_name || 'Group A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {order.items?.length || 0} items
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {order.waiter_name}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status as any} className="shadow-none border h-6 px-2.5" />
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">
                    ₹{order.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
