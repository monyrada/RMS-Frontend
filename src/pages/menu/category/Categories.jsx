import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { categories } from "../../../data/mockData.js";

export default function Categories() {
  const [items, setItems] = useState(categories);

  const toggle = (id) => setItems(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));

  return (
    <div className="space-y-4 fade-in">
      <div className="flex justify-end">
        <button className="btn-primary flex items-center gap-1.5"><Plus size={14} /> Add Category</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {items.map((cat) => (
          <div key={cat.id} className="card flex items-center justify-between p-4 sm:p-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-forest-900 flex items-center justify-center text-2xl shrink-0">{cat.icon}</div>
              <div className="min-w-0">
                <p className="font-semibold text-forest-900 truncate">{cat.name}</p>
                <p className="text-xs text-gray-400">{cat.itemCount} items</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button onClick={() => toggle(cat.id)}
                className={`relative w-10 h-5 rounded-full transition-colors ${cat.active ? "bg-forest-600" : "bg-gray-200"}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${cat.active ? "translate-x-5" : "translate-x-0.5"}`}></span>
              </button>
              <button className="p-1.5 rounded-lg hover:bg-cream-100 text-gray-400 hover:text-forest-700 transition-colors"><Edit2 size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
