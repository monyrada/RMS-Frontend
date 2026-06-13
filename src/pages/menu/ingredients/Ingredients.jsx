import { Plus, AlertTriangle, Edit2, Package } from "lucide-react";
import { ingredients } from "../../../data/mockData.js";

export default function Ingredients() {
  const lowStock = ingredients.filter((i) => i.stock <= i.minStock);

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{ingredients.length} ingredients tracked</div>
        <button className="btn-primary flex items-center gap-1.5"><Plus size={14} /> Add Ingredient</button>
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{lowStock.length} item{lowStock.length > 1 ? "s" : ""} low on stock</p>
            <p className="text-xs text-amber-600 mt-0.5">{lowStock.map(i => i.name).join(", ")}</p>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2.5">
        {ingredients.map((ing) => {
          const low = ing.stock <= ing.minStock;
          const pct = Math.min((ing.stock / (ing.minStock * 3)) * 100, 100);
          return (
            <div key={ing.id} className={`card p-4 ${low ? "border-red-200" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package size={14} className={low ? "text-red-400" : "text-forest-500"} />
                  <span className="font-semibold text-forest-900 text-sm">{ing.name}</span>
                </div>
                <span className={`badge text-xs ${low ? "bg-red-100 text-red-600" : "bg-forest-300/20 text-forest-700"}`}>{low ? "Low" : "OK"}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>{ing.supplier}</span>
                <span>${ing.cost.toFixed(2)}/{ing.unit}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${low ? "bg-red-400" : "bg-forest-500"}`} style={{ width: `${pct}%` }} />
                </div>
                <span className={`text-xs font-semibold ${low ? "text-red-600" : "text-forest-700"}`}>{ing.stock}/{ing.minStock * 3} {ing.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead className="border-b border-cream-200">
              <tr>
                <th className="table-th">Ingredient</th>
                <th className="table-th">Supplier</th>
                <th className="table-th text-right">Stock</th>
                <th className="table-th text-right">Min. Stock</th>
                <th className="table-th text-right">Unit Cost</th>
                <th className="table-th">Level</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Edit</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing) => {
                const low = ing.stock <= ing.minStock;
                const pct = Math.min((ing.stock / (ing.minStock * 3)) * 100, 100);
                return (
                  <tr key={ing.id} className={`hover:bg-cream-50/60 transition-colors ${low ? "bg-red-50/30" : ""}`}>
                    <td className="table-td font-semibold text-forest-900 text-sm">{ing.name}</td>
                    <td className="table-td text-gray-500 text-sm">{ing.supplier}</td>
                    <td className="table-td text-right">
                      <span className={`font-semibold text-sm ${low ? "text-red-600" : "text-forest-800"}`}>{ing.stock} {ing.unit}</span>
                    </td>
                    <td className="table-td text-right text-gray-400 text-sm">{ing.minStock} {ing.unit}</td>
                    <td className="table-td text-right text-gray-500 text-sm">${ing.cost.toFixed(2)}</td>
                    <td className="table-td">
                      <div className="w-20 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${low ? "bg-red-400" : "bg-forest-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="table-td">
                      <span className={`badge text-xs ${low ? "bg-red-100 text-red-600" : "bg-forest-300/20 text-forest-700"}`}>{low ? "Low Stock" : "OK"}</span>
                    </td>
                    <td className="table-td">
                      <div className="flex justify-end">
                        <button className="p-1.5 rounded-lg hover:bg-cream-100 text-gray-400 hover:text-forest-700 transition-colors"><Edit2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
