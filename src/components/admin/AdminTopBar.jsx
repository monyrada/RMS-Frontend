import { useState, useRef, useEffect } from "react";
import { Bell, ChevronRight, ChevronDown, LogOut, Menu, Settings, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const BREADCRUMB_MAP = {
    "/admin/dashboard":        ["Dashboard"],
    "/admin/menu/items":       ["Menu", "Items"],
    "/admin/menu/categories":  ["Menu", "Categories"],
    "/admin/menu/ingredients": ["Menu", "Ingredients"],
    "/admin/orders":           ["Orders"],
    "/admin/tables":           ["Tables"],
    "/admin/payment":          ["Payment"],
    "/admin/settings":         ["Settings"],
};

/* ─── Avatar ─────────────────────────────────────────────────────────────── */
function Avatar({ name }) {
    const initials =
        name
            ?.split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "?";

    return (
        <div className="w-7 h-7 rounded-lg bg-forest-800 flex items-center justify-center text-white text-[11px] font-medium shrink-0">
            {initials}
        </div>
    );
}

/* ─── ProfileDropdown ────────────────────────────────────────────────────── */
function ProfileDropdown({ onClose }) {
    const navigate = useNavigate();
    const { user } = useAuth();

    const items = [
        { icon: <User size={13} />,     label: "Profile",  action: () => navigate("/admin/settings") },
        { icon: <Settings size={13} />, label: "Settings", action: () => navigate("/admin/settings") },
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-cream-200 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-3 py-2.5 border-b border-cream-100">
                <p className="text-xs font-medium text-forest-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
            </div>

            <div className="py-1">
                {items.map(({ icon, label, action }) => (
                    <button
                        key={label}
                        onClick={() => { action(); onClose(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-cream-50 transition-colors"
                    >
                        <span className="text-gray-400">{icon}</span>
                        {label}
                    </button>
                ))}
            </div>

            <div className="border-t border-cream-100 py-1">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={13} />
                    Sign out
                </button>
            </div>
        </div>
    );
}

/* ─── AdminTopBar ────────────────────────────────────────────────────────── */
/**
 * Props:
 *  - onMenuToggle : () => void   — called when the mobile ☰ button is tapped.
 *                                  The sidebar/layout should listen to this to
 *                                  open/close the drawer. The sidebar must NOT
 *                                  render its own floating toggle button.
 */
export default function AdminTopBar({ onMenuToggle }) {
    const location = useLocation();
    const crumbs   = BREADCRUMB_MAP[location.pathname] || ["RMS"];
    const title    = crumbs[crumbs.length - 1];

    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const { user }   = useAuth();

    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target))
                setProfileOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <header className="h-14 bg-white border-b border-cream-200 flex items-center gap-2 px-3 sm:px-4 sticky top-0 z-30">

            {/* ── Mobile hamburger (only on < lg) ───────────────────────────────── */}
            {/*
          IMPORTANT: Remove / hide any other hamburger button your sidebar or
          layout renders on mobile. This is the single source of truth for the
          toggle. Pass `onMenuToggle` from your layout to wire it up.
      */}
            <button
                onClick={onMenuToggle}
                className="lg:hidden shrink-0 w-8 h-8 rounded-xl bg-forest-800 flex items-center justify-center hover:bg-forest-700 transition-colors"
                aria-label="Toggle sidebar"
            >
                <Menu size={16} className="text-white" />
            </button>

            {/* ── Breadcrumb / page title ───────────────────────────────────────── */}
            <div className="flex-1 min-w-0 flex items-center">
                {/* Desktop: full breadcrumb trail */}
                <nav className="hidden sm:flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
                    {crumbs.map((crumb, i) => (
                        <span key={crumb} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} className="text-gray-300" />}
                            <span
                                className={
                                    i === crumbs.length - 1
                                        ? "font-semibold text-forest-900"
                                        : "text-gray-400"
                                }
                            >
                {crumb}
              </span>
            </span>
                    ))}
                </nav>

                {/* Mobile: just the current page name */}
                <h1 className="sm:hidden text-sm font-semibold text-forest-900 truncate">
                    {title}
                </h1>
            </div>

            {/* ── Right actions ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 shrink-0">

                {/* Notification bell */}
                <button
                    className="relative w-8 h-8 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-center hover:bg-cream-100 transition-colors"
                    aria-label="Notifications"
                >
                    <Bell size={14} className="text-gray-500" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />
                </button>

                {/* Divider — hidden on mobile to save space */}
                <div className="hidden sm:block w-px h-5 bg-cream-200" />

                {/* Profile button + dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen((v) => !v)}
                        className="flex items-center gap-2 pl-1 pr-1 sm:pr-2 py-1 rounded-xl bg-cream-50 border border-cream-200 hover:bg-cream-100 transition-colors"
                        aria-label="Account menu"
                        aria-expanded={profileOpen}
                    >
                        <Avatar name={user?.name || "Admin User"} />

                        {/* Name + role — desktop only */}
                        <div className="hidden sm:flex flex-col items-start max-w-[100px]">
              <span className="text-xs font-medium text-forest-900 leading-none truncate w-full">
                {user?.name}
              </span>
                            <span className="text-[11px] text-gray-400 leading-none mt-0.5 truncate w-full capitalize">
                {user?.role}
              </span>
                        </div>

                        <ChevronDown
                            size={12}
                            className={`text-gray-400 transition-transform hidden sm:block ${profileOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} />}
                </div>
            </div>
        </header>
    );
}
