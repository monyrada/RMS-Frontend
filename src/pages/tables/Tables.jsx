import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { tables } from "../../data/mockData";

const statusConfig = {
  available: { border: "border-forest-400", bg: "bg-forest-400/10", text: "text-forest-700", dot: "bg-forest-400", label: "Available" },
  occupied: { border: "border-amber-400", bg: "bg-amber-400/10", text: "text-amber-700", dot: "bg-amber-400", label: "Occupied" },
  reserved: { border: "border-blue-400", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400", label: "Reserved" },
  cleaning: { border: "border-gray-300", bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-300", label: "Cleaning" },
};

const counts = (s) => tables.filter((t) => t.status === s).length;

export default function Tables() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-4 fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className={`card p-4 flex items-center gap-3 border-l-4 ${cfg.border}`}>
            <div>
              <p className="text-2xl font-black text-forest-900">{counts(key)}</p>
              <p className="text-xs text-gray-500">{cfg.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`}></span>
            {cfg.label}
          </div>
        ))}
        <button className="ml-auto btn-primary flex items-center gap-1.5 text-xs py-1.5"><Plus size={13} /> Add Table</button>
      </div>

      {/* Floor plan grid */}
      <div className="card p-4 sm:p-5">
        <h3 className="font-semibold text-forest-900 mb-4 text-sm">Floor Layout</h3>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2 sm:gap-3">
          {tables.map((table) => {
            const cfg = statusConfig[table.status];
            const isSelected = selected === table.id;
            return (
              <button
                key={table.id}
                onClick={() => setSelected(isSelected ? null : table.id)}
                className={`border-2 rounded-xl p-2.5 sm:p-3 text-left transition-all duration-200 hover:scale-105 active:scale-95 ${cfg.border} ${cfg.bg} ${isSelected ? "ring-2 ring-offset-1 ring-forest-500 scale-105" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-black text-xs ${cfg.text}`}>{table.name}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Users size={9} className="text-gray-400" />
                  <span className="text-xs text-gray-400">{table.seats}</span>
                </div>
                {table.server && <p className="text-xs text-gray-400 truncate mt-0.5">{table.server.split(" ")[0]}</p>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected table detail */}
      {selected && (() => {
        const t = tables.find(x => x.id === selected);
        const cfg = statusConfig[t.status];
        return (
          <div className={`card border-2 ${cfg.border} p-4 slide-up`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center`}>
                  <span className={`font-black text-sm ${cfg.text}`}>{t.name}</span>
                </div>
                <div>
                  <p className="font-bold text-forest-900">{t.name} · {t.seats} seats</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                    <span className={`text-sm font-medium ${cfg.text}`}>{cfg.label}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {t.orderId && <p className="text-sm font-semibold text-forest-900">{t.orderId}</p>}
                {t.server && <p className="text-xs text-gray-400">{t.server}</p>}
                {t.status === "available" && (
                  <button className="mt-2 btn-primary text-xs py-1.5 px-3">Assign Table</button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
