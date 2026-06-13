import { Bell, Search, Sun } from "lucide-react";

export default function TopBar({ title, subtitle }) {
  return (
    <header className="h-16 bg-white border-b border-cream-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="font-bold text-forest-900 text-lg leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 rounded-xl bg-cream-50 border border-cream-200 text-sm outline-none focus:border-forest-400 w-52 transition-colors"
          />
        </div>
        <button className="relative w-9 h-9 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-center hover:bg-cream-100 transition-colors">
          <Bell size={16} className="text-forest-700" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-rms rounded-full"></span>
        </button>
        <button className="w-9 h-9 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-center hover:bg-cream-100 transition-colors">
          <Sun size={16} className="text-forest-700" />
        </button>
      </div>
    </header>
  );
}
