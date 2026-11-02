import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ADMIN_LANDING_ROUTES = [
  { to: "/admin/dashboard" },
  { to: "/admin/orders", permission: "ORDER_VIEW" },
  { to: "/admin/menu/items", permission: "MENU_VIEW" },
  { to: "/admin/tables", permission: "TABLE_VIEW" },
  { to: "/admin/settings/users", permission: "USER_MANAGE" },
  { to: "/admin/settings/roles", permission: "ROLE_MANAGE" },
];

export default function ProtectedRoute({ children, permission }) {
  const { user, can } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  if (permission && !can(permission)) {
    const fallback = ADMIN_LANDING_ROUTES.find((r) => can(r.permission));
    // Avoid a redirect loop when the fallback is the page being denied.
    if (fallback && fallback.to !== location.pathname) {
      return <Navigate to={fallback.to} replace />;
    }
    return (
      <div className="p-8 text-center text-gray-500">
        You don't have permission to view this page.
      </div>
    );
  }
  return children;
}
