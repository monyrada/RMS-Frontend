import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopBar from "../components/admin/AdminTopBar";

/**
 * AdminLayout
 *
 * Single source of truth for mobile sidebar state.
 * AdminTopBar owns the ☰ button → calls onMenuToggle → lifts state up here.
 * AdminSidebar receives mobileOpen + onClose as props.
 */
export default function AdminLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-cream-50">
            {/* Sidebar */}
            <AdminSidebar
                mobileOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />

            {/* Main area — offset by sidebar width on desktop */}
            <div className="lg:ml-60 flex flex-col min-h-screen">
                {/* Top bar — owns the ☰ hamburger on mobile */}
                <AdminTopBar onMenuToggle={() => setMobileOpen((v) => !v)} />

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
