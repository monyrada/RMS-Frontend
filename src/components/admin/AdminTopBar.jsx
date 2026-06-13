import { Bell, Search, ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";

const breadcrumbMap = {
  "/admin/dashboard": ["Dashboard"],
  "/admin/menu/items": ["Menu", "Items"],
  "/admin/menu/categories": ["Menu", "Categories"],
  "/admin/menu/ingredients": ["Menu", "Ingredients"],
  "/admin/orders": ["Orders"],
  "/admin/tables": ["Tables"],
  "/admin/payment": ["Payment"],
  "/admin/settings": ["Settings"],
};

export default function AdminTopBar() {
  const location = useLocation();
  const crumbs = breadcrumbMap[location.pathname] || ["RMS"];
  const title = crumbs[crumbs.length - 1];

  return (
    <header className="h-16 bg-white border-b border-cream-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 pl-12 lg:pl-0">
        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-1.5 text-sm">
          {crumbs.map((c, i) => (
            <span key={c} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={13} className="text-gray-300" />}
              <span className={i === crumbs.length - 1 ? "font-bold text-forest-900" : "text-gray-400"}>
                {c}
              </span>
            </span>
          ))}
        </nav>
        <h1 className="sm:hidden font-bold text-forest-900">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-4 py-2 rounded-xl bg-cream-50 border border-cream-200 text-sm outline-none focus:border-forest-400 w-48 lg:w-60 transition-all"
          />
        </div>
        <button className="relative w-9 h-9 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-center hover:bg-cream-100 transition-colors">
          <Bell size={15} className="text-forest-700" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-rms rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
