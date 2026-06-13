import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopBar from "../components/admin/AdminTopBar";

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-cream-50">
      <AdminSidebar />
      <div className="flex-1 lg:ml-60 flex flex-col overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
