import Sidebar from "../components/layouts/Sidebar.jsx";
import TopBar from "../components/layouts/TopBar.jsx";
import { Outlet, useLocation } from "react-router-dom";

const pageMeta = {
  "/": { title: "Dashboard", subtitle: "Sunday, June 13, 2026" },
  "/menu/items": { title: "Menu Items", subtitle: "Manage your food and drink items" },
  "/menu/categories": { title: "Categories", subtitle: "Organize your menu sections" },
  "/menu/ingredients": { title: "Ingredients", subtitle: "Track inventory and stock" },
  "/orders": { title: "Orders", subtitle: "Live order management" },
  "/tables": { title: "Table Layout", subtitle: "Floor plan and table status" },
  "/payment": { title: "Payments", subtitle: "Transaction history" },
  "/settings": { title: "Settings", subtitle: "Restaurant configuration" },
};

export default function MainLayout() {
  const location = useLocation();
  const meta = pageMeta[location.pathname] || { title: "RMS", subtitle: "" };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col overflow-hidden">
        <TopBar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto p-6 bg-cream-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
