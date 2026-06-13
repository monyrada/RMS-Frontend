import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Eye, SlidersHorizontal } from "lucide-react";
import { menuItems } from "../../data/mockData";

const statusStyle = {
  available: "bg-forest-300/20 text-forest-700",
  unavailable: "bg-red-100 text-red-600",
};

function ItemCard({ item }) {
  const margin = (((item.price - item.cost) / item.price) * 100).toFixed(0);
  return (
    <div className="card p-4 flex gap-3">
      <div className="w-12 h-12 rounded-xl bg-forest-900 flex items-center justify-center text-2xl shrink-0">🍽️</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-forest-900 text-sm leading-tight truncate">{item.name}</p>
          <span className={`badge shrink-0 ${statusStyle[item.status]}`}>{item.status}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-sm font-bold text-forest-800">${item.price.toFixed(2)}</span>
          <span className="text-xs text-gray-400">Cost: ${item.cost.toFixed(2)}</span>
          <span className={`text-xs font-semibold ${Number(margin) > 60 ? "text-forest-600" : "text-amber-600"}`}>{margin}% margin</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button className="p-1.5 rounded-lg hover:bg-cream-100 text-gray-400 hover:text-forest-700 transition-colors"><Eye size={13} /></button>
        <button className="p-1.5 rounded-lg hover:bg-cream-100 text-gray-400 hover:text-forest-700 transition-colors"><Edit2 size={13} /></button>
        <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
      </div>
    </div>
  );
}

export default function MenuItems() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState("table"); // table | cards

  const categories = ["All", ...new Set(menuItems.map((i) => i.category))];
  const filtered = menuItems.filter(
    (i) => (filter === "All" || i.category === filter) &&
      i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 flex-wrap flex-1">
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95 ${filter === c ? "bg-forest-700 text-white" : "bg-white text-gray-600 border border-cream-200 hover:bg-cream-50"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-8 pr-3 py-2 rounded-xl bg-white border border-cream-200 text-sm outline-none focus:border-forest-400 w-full sm:w-44 transition-all" />
          </div>
          <button onClick={() => setView(v => v === "table" ? "cards" : "table")} className="p-2 rounded-xl bg-white border border-cream-200 hover:bg-cream-50 text-gray-500 shrink-0">
            <SlidersHorizontal size={15} />
          </button>
          <button className="btn-primary flex items-center gap-1.5 shrink-0 whitespace-nowrap"><Plus size={14} /> <span className="hidden sm:inline">Add Item</span><span className="sm:hidden">Add</span></button>
        </div>
      </div>

      {/* Cards view (mobile default, also selectable) */}
      {view === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      ) : (
        /* Table view */
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="border-b border-cream-200">
                <tr>
                  <th className="table-th">Item</th>
                  <th className="table-th">Category</th>
                  <th className="table-th text-right">Price</th>
                  <th className="table-th text-right">Cost</th>
                  <th className="table-th text-right">Margin</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const margin = (((item.price - item.cost) / item.price) * 100).toFixed(0);
                  return (
                    <tr key={item.id} className="hover:bg-cream-50/60 transition-colors">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-forest-900 flex items-center justify-center text-base shrink-0">🍽️</div>
                          <div>
                            <p className="font-semibold text-forest-900 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[160px]">{item.ingredients.slice(0,3).join(", ")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td text-gray-500 text-sm">{item.category}</td>
                      <td className="table-td text-right font-semibold text-forest-800">${item.price.toFixed(2)}</td>
                      <td className="table-td text-right text-gray-400">${item.cost.toFixed(2)}</td>
                      <td className="table-td text-right">
                        <span className={`font-semibold text-sm ${Number(margin) > 60 ? "text-forest-600" : "text-amber-600"}`}>{margin}%</span>
                      </td>
                      <td className="table-td"><span className={`badge ${statusStyle[item.status]}`}>{item.status}</span></td>
                      <td className="table-td">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-cream-100 text-gray-400 hover:text-forest-700 transition-colors"><Eye size={13} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-cream-100 text-gray-400 hover:text-forest-700 transition-colors"><Edit2 size={13} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No items found.</div>
          )}
        </div>
      )}
    </div>
  );
}
