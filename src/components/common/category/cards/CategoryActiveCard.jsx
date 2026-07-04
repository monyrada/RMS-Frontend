import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
export default function CategoryActiveCard({category,onToggle}) {
    if (!category) return null;
    return (
        <div
            key={category.id}
            className="card flex items-center justify-between p-4 sm:p-5"
          >
            
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-forest-900 flex items-center justify-center text-2xl shrink-0">{category.icon}</div>
              <div className="min-w-0">
                <p className="font-semibold text-forest-900 truncate">{category.name}</p>
                <p className="text-xs text-gray-400">{category.itemCount} items</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2 ">
              <button onClick={() => onToggle(category.id)}
                className={`relative w-10 h-5 rounded-full transition-colors ${category.status ? "bg-forest-600" : "bg-gray-200"}`}>
                <span className={`absolute bottom-0 top-0.5 left-0.5 w-4 h-4 mr-10 bg-white rounded-full shadow transition-transform ${category.status ? "translate-x-5" : "translate-x-0"}`}></span>
              </button>
              <button className="p-1.5 rounded-lg hover:bg-cream-100 text-gray-400 hover:text-forest-700 transition-colors"><Edit2 size={13} /></button>
              <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
            </div>
        
        </div>
    );
}