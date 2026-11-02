import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import { useToast } from "./components/ui/Toast";

// Admin
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import MenuItems from "./pages/menu/items/MenuItems.jsx";
import Categories from "./pages/menu/category/Categories.jsx";
import Ingredients from "./pages/menu/ingredients/Ingredients.jsx";
import Orders from "./pages/orders/Orders";
import Tables from "./pages/tables/Tables";
import Payment from "./pages/payment/Payment";
import Settings from "./pages/settings/Settings";
import Users from "./pages/settings/users/User-management.jsx"
import Roles from "./pages/settings/roles/RoleManagement.jsx";

// User Profile
import UserProfile from "./pages/profile/UserProfile.jsx"

// Customer
import CustomerWelcome from "./pages/customer/CustomerWelcome";
import CustomerMenu from "./pages/customer/CustomerMenu";
import CustomerCart from "./pages/customer/CustomerCart";
import OrderConfirm from "./pages/customer/OrderConfirm";
import OrderHistory from "./pages/customer/OrderHistory";

const CUSTOMER_PATHS = ["/", "/menu", "/cart", "/order-confirm", "/orders"];

function ToastPositionSync() {
  const location = useLocation();
  const { setPosition } = useToast();

  useEffect(() => {
    setPosition(CUSTOMER_PATHS.includes(location.pathname) ? "top-center" : "bottom-right");
  }, [location.pathname, setPosition]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ToastPositionSync />
          <Routes>
            {/* ── Customer Routes ── */}
            <Route path="/" element={<CustomerWelcome />} />
            <Route path="/menu" element={<CustomerMenu />} />
            <Route path="/cart" element={<CustomerCart />} />
            <Route path="/order-confirm" element={<OrderConfirm />} />
            <Route path="/orders" element={<OrderHistory />} />

            {/* ── Admin Routes ── */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="menu" element={<Navigate to="/admin/menu/items" replace />} />
              <Route path="menu/items" element={<ProtectedRoute permission="MENU_VIEW"><MenuItems /></ProtectedRoute>} />
              <Route path="menu/categories" element={<ProtectedRoute permission="MENU_VIEW"><Categories /></ProtectedRoute>} />
              <Route path="menu/ingredients" element={<ProtectedRoute permission="MENU_VIEW"><Ingredients /></ProtectedRoute>} />
              <Route path="orders" element={<ProtectedRoute permission="ORDER_VIEW"><Orders /></ProtectedRoute>} />
              <Route path="tables" element={<ProtectedRoute permission="TABLE_VIEW"><Tables /></ProtectedRoute>} />
              <Route path="payment" element={<Payment />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/users" element={<ProtectedRoute permission="USER_MANAGE"><Users /></ProtectedRoute>} />
              <Route path="settings/roles" element={<ProtectedRoute permission="ROLE_MANAGE"><Roles /></ProtectedRoute>} />
              <Route path="profile" element={<UserProfile />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
