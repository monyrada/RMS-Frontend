import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard, UtensilsCrossed, ShoppingBag, LayoutGrid,
    CreditCard, Settings, ChevronDown, ChevronRight,
    List, Tag, FlaskConical, Leaf, X,
} from "lucide-react";
//import { useAuth } from "../../context/AuthContext";

const menuChildren = [
    { label: "Items",       to: "/admin/menu/items",       icon: List },
    { label: "Categories",  to: "/admin/menu/categories",  icon: Tag },
    { label: "Ingredients", to: "/admin/menu/ingredients", icon: FlaskConical },
];

const navItems = [
    { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Menu",      icon: UtensilsCrossed,  children: menuChildren },
    { label: "Orders",    to: "/admin/orders",    icon: ShoppingBag },
    { label: "Tables",    to: "/admin/tables",    icon: LayoutGrid },
    { label: "Payment",   to: "/admin/payment",   icon: CreditCard },
    { label: "Settings",  to: "/admin/settings",  icon: Settings },
];

function SidebarContent({ onClose }) {
    const [menuOpen, setMenuOpen] = useState(true);
    const location = useLocation();
    const isMenuActive = location.pathname.startsWith("/admin/menu");

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
                    {/* Close button — mobile only */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-forest-400 hover:text-white lg:hidden p-1 rounded-lg hover:bg-forest-800 transition-colors"
                            aria-label="Close sidebar"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
                <p className="text-forest-500 text-xs font-semibold uppercase tracking-widest px-4 mb-3">
                    Navigation
                </p>
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
                                    {menuOpen
                                        ? <ChevronDown size={13} />
                                        : <ChevronRight size={13} />}
                                </button>
                                {menuOpen && (
                                    <div className="mt-0.5 space-y-0.5">
                                        {item.children.map((child) => (
                                            <NavLink
                                                key={child.to}
                                                to={child.to}
                                                onClick={onClose}
                                                className={({ isActive }) =>
                                                    `sidebar-item-sub ${isActive ? "active" : ""}`
                                                }
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
                            key={item.to}
                            to={item.to}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `sidebar-item ${isActive ? "active" : ""}`
                            }
                        >
                            <item.icon size={16} />{item.label}
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
}

/**
 * AdminSidebar
 *
 * Props:
 *  - mobileOpen : boolean    — controlled by the parent layout
 *  - onClose    : () => void — called when the user taps the X or the overlay
 *
 * The hamburger ☰ button lives in AdminTopBar, NOT here.
 */
export default function AdminSidebar({ mobileOpen, onClose }) {
    return (
        <>
            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            {/* Mobile drawer */}
            <aside
                className={`
          fixed left-0 top-0 h-screen w-64 bg-forest-900 z-50
          transition-transform duration-300 lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                <SidebarContent onClose={onClose} />
            </aside>

            {/* Desktop sidebar — always visible */}
            <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen w-60 bg-forest-900 z-40">
                <SidebarContent />
            </aside>
        </>
    );
}
