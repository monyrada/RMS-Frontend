import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";

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

// Customer
import CustomerWelcome from "./pages/customer/CustomerWelcome";
import CustomerMenu from "./pages/customer/CustomerMenu";
import CustomerCart from "./pages/customer/CustomerCart";
import OrderConfirm from "./pages/customer/OrderConfirm";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Customer Routes ── */}
            <Route path="/" element={<CustomerWelcome />} />
            <Route path="/menu" element={<CustomerMenu />} />
            <Route path="/cart" element={<CustomerCart />} />
            <Route path="/order-confirm" element={<OrderConfirm />} />

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
              <Route path="menu/items" element={<MenuItems />} />
              <Route path="menu/categories" element={<Categories />} />
              <Route path="menu/ingredients" element={<Ingredients />} />
              <Route path="orders" element={<Orders />} />
              <Route path="tables" element={<Tables />} />
              <Route path="payment" element={<Payment />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/users" element={<Users />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
