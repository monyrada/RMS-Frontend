import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, LayoutGrid,
  CreditCard, Settings, ChevronDown, ChevronRight,
  List, Tag, FlaskConical, Leaf, Users,
} from "lucide-react";

const menuNav = [
  { label: "Items", to: "/menu/items", icon: List },
  { label: "Categories", to: "/menu/categories", icon: Tag },
  { label: "Ingredients", to: "/menu/ingredients", icon: FlaskConical },
];

/* Settings submenu — mirrors menuNav's shape/pattern */
const settingsNav = [
  { label: "Users", to: "/settings/users", icon: Users },
];

const navItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Menu", icon: UtensilsCrossed, children: menuNav },
  { label: "Orders", to: "/orders", icon: ShoppingBag },
  { label: "Tables", to: "/tables", icon: LayoutGrid },
  { label: "Payment", to: "/payment", icon: CreditCard },
  { label: "Settings", icon: Settings, children: settingsNav },
];

export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const location = useLocation();
  const isMenuActive = location.pathname.startsWith("/menu");
  const isSettingsActive = location.pathname.startsWith("/settings");

  /* Track open/closed state per top-level label so this scales
     cleanly if more collapsible sections get added later */
  const openState = { Menu: [menuOpen, setMenuOpen], Settings: [settingsOpen, setSettingsOpen] };

  return (
      <aside className="fixed left-0 top-0 h-screen w-60 bg-forest-900 flex flex-col z-40 select-none">
        {/* Brand */}
        <div className="sidebar-brand relative overflow-hidden px-5 py-5 border-b border-forest-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-rms rounded-xl flex items-center justify-center shadow-lg shadow-amber-rms/30">
              <Leaf size={18} className="text-forest-950" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight tracking-tight">RMS</p>
              <p className="text-forest-400 text-xs">Restaurant Manager</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <p className="text-forest-500 text-xs font-semibold uppercase tracking-widest px-4 mb-2">Main</p>

          {navItems.map((item) => {
            if (item.children) {
              const [isOpen, setIsOpen] = openState[item.label];
              const isActive = item.label === "Menu" ? isMenuActive : isSettingsActive;

              return (
                  <div key={item.label}>
                    <button
                        onClick={() => setIsOpen((o) => !o)}
                        className={`sidebar-item w-full justify-between ${isActive ? "active" : ""}`}
                    >
                  <span className="flex items-center gap-3">
                    <item.icon size={16} />
                    {item.label}
                  </span>
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    {isOpen && (
                        <div className="mt-1 space-y-0.5">
                          {item.children.map((child) => (
                              <NavLink
                                  key={child.to}
                                  to={child.to}
                                  className={({ isActive }) =>
                                      `sidebar-item-sub ${isActive ? "active" : ""}`
                                  }
                              >
                                <child.icon size={14} />
                                {child.label}
                              </NavLink>
                          ))}
                        </div>
                    )}
                  </div>
              );
            }

            return (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                        `sidebar-item ${isActive ? "active" : ""}`
                    }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-forest-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-forest-700 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">Admin</p>
              <p className="text-forest-400 text-xs truncate">admin@rms.com</p>
            </div>
          </div>
        </div>
      </aside>
  );
}
