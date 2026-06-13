import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, LayoutGrid,
  CreditCard, Settings, ChevronDown, ChevronRight,
  List, Tag, FlaskConical, Leaf, LogOut, X, Menu, User
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const menuChildren = [
  { label: "Items", to: "/admin/menu/items", icon: List },
  { label: "Categories", to: "/admin/menu/categories", icon: Tag },
  { label: "Ingredients", to: "/admin/menu/ingredients", icon: FlaskConical },
];

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Menu", icon: UtensilsCrossed, children: menuChildren },
  { label: "Orders", to: "/admin/orders", icon: ShoppingBag },
  { label: "Tables", to: "/admin/tables", icon: LayoutGrid },
  { label: "Payment", to: "/admin/payment", icon: CreditCard },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

function SidebarContent({ onClose }) {
  const [menuOpen, setMenuOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMenuActive = location.pathname.startsWith("/admin/menu");

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="sidebar-brand relative overflow-hidden px-5 py-5 border-b border-forest-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-rms rounded-xl flex items-center justify-center shadow-lg shadow-amber-rms/30">
              <Leaf size={18} className="text-forest-950" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">RMS</p>
              <p className="text-forest-400 text-xs">Restaurant Manager</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-forest-400 hover:text-white lg:hidden">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="text-forest-500 text-xs font-semibold uppercase tracking-widest px-4 mb-3">Navigation</p>
        {navItems.map((item) => {
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className={`sidebar-item w-full justify-between ${isMenuActive ? "active" : ""}`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon size={16} />{item.label}
                  </span>
                  {menuOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
                {menuOpen && (
                  <div className="mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to} to={child.to}
                        onClick={onClose}
                        className={({ isActive }) => `sidebar-item-sub ${isActive ? "active" : ""}`}
                      >
                        <child.icon size={13} />{child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <NavLink
              key={item.to} to={item.to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
            >
              <item.icon size={16} />{item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-forest-800 space-y-1">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-rms flex items-center justify-center text-forest-950 text-xs font-black">
            {user?.avatar || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-forest-500 text-xs truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-forest-900 rounded-xl flex items-center justify-center text-white shadow-lg"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-forest-900 z-50 transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen w-60 bg-forest-900 z-40">
        <SidebarContent />
      </aside>
    </>
  );
}
