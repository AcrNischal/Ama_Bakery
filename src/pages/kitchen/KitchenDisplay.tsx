import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OrderCard } from "@/components/kitchen/OrderCard";
import { Button } from "@/components/ui/button";
import { ChefHat, LogOut, Bell, CheckCircle2, Clock, RotateCcw, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { getOrders, updateOrder } from "@/services/dataService";
import { parseISO, format } from "date-fns";

export default function KitchenDisplay() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      if (!silent) toast.error("Failed to fetch orders");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 10 seconds
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrder(orderId, { status: newStatus });

      // Optimistic update
      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      ));

      if (newStatus === 'ready') {
        toast.success("Order is ready!", {
          description: "Moving to Ready column",
        });
      } else if (newStatus === 'completed') {
        toast.success("Order completed!");
      }
    } catch (err) {
      toast.error("Failed to update status");
      fetchOrders(true); // Re-sync with backend
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-muted-foreground font-medium">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p>Connecting to Kitchen Feed...</p>
      </div>
    );
  }

  const newOrders = orders.filter(o => o.status === 'new' || o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-white border-b px-6 py-4 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Kitchen Display</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Feed
                </div>
                <div className="h-4 w-px bg-slate-200" />

                {/* Completed Orders Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-full cursor-pointer hover:bg-slate-200 transition-colors">
                      <span className="text-xs font-medium text-slate-500">Completed today:</span>
                      <span className="text-xs font-bold text-slate-700">{completedOrders.length}</span>
                    </div>
                  </SheetTrigger>
                  <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader className="mb-6">
                      <SheetTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        Completed Orders Today
                      </SheetTitle>
                    </SheetHeader>

                    <div className="space-y-4">
                      {completedOrders.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                          <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>No completed orders yet today</p>
                        </div>
                      ) : (
                        completedOrders
                          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                          .map(order => (
                            <div key={order.id} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="font-bold text-slate-800">Order #{order.id}</h3>
                                  <p className="text-sm text-slate-500">Table {order.table_number} • {order.waiter_name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">
                                    {format(parseISO(order.created_at), 'HH:mm')}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-amber-600"
                                    onClick={() => handleStatusChange(order.id, 'ready')}
                                    title="Undo Completion"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-1">
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex gap-2 text-sm">
                                    <span className="font-bold text-slate-600 w-4">{item.quantity}x</span>
                                    <span className="text-slate-700 flex-1">{item.menu_item_name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/')} className="gap-2">
            <LogOut className="h-4 w-4" />
            Exit KDS
          </Button>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="flex-1 p-4 overflow-hidden">
        <div className="grid grid-cols-2 gap-6 h-full">
          {/* New Orders Column */}
          <div className="flex flex-col h-full bg-slate-100/50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <h2 className="font-bold text-slate-800">New Orders</h2>
              </div>
              <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-md text-xs">
                {newOrders.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
              {newOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                    <Bell className="h-6 w-6 opacity-20" />
                  </div>
                  <p className="text-sm font-medium">No new orders</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 content-start">
                  {newOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ready Column */}
          <div className="flex flex-col h-full bg-slate-100/50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <h2 className="font-bold text-slate-800">Ready to Serve</h2>
              </div>
              <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md text-xs">
                {readyOrders.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
              {readyOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="w-12 h-1 border-2 border-slate-200 rounded-full opacity-50" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 content-start">
                  {readyOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
