import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";

// Waiter Pages
import WaiterLogin from "./pages/waiter/WaiterLogin";
import TableSelection from "./pages/waiter/TableSelection";
import OrderEntry from "./pages/waiter/OrderEntry";
import Checkout from "./pages/waiter/Checkout";
import OrderStatus from "./pages/waiter/OrderStatus";
import PaymentCollection from "./pages/waiter/PaymentCollection";

// Kitchen Pages
import KitchenDisplay from "./pages/kitchen/KitchenDisplay";

// Admin Pages & Layout
import { AdminLayout } from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTables from "./pages/admin/AdminTables";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          {/* Role Selection */}
          <Route path="/" element={<RoleSelection />} />
          <Route path="/login/:roleId" element={<Login />} />

          {/* Waiter Routes */}
          <Route path="/waiter" element={<WaiterLogin />} />
          <Route element={<ProtectedRoute allowedRoles={['admin', 'supervisor', 'waiter']} />}>
            <Route path="/waiter/tables" element={<TableSelection />} />
            <Route path="/waiter/order/:tableNumber" element={<OrderEntry />} />
            <Route path="/waiter/checkout" element={<Checkout />} />
            <Route path="/waiter/orders" element={<OrderStatus />} />
            <Route path="/waiter/payment" element={<PaymentCollection />} />
          </Route>

          {/* Kitchen Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'supervisor', 'kitchen']} />}>
            <Route path="/kitchen" element={<KitchenDisplay />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'supervisor']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="menu" element={<AdminMenu />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="tables" element={<AdminTables />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
