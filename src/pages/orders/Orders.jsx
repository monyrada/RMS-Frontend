import { useState } from "react";
import { Plus, RefreshCw, ChevronRight } from "lucide-react";
import { orders } from "../../data/mockData";

const statusColors = {
  preparing: "bg-amber-100 text-amber-800",
  served: "bg-blue-100 text-blue-800",
  pending: "bg-gray-100 text-gray-700",
  paid: "bg-forest-300/30 text-forest-800",
  cancelled: "bg-red-100 text-red-700",
};

const statusDot = {
  preparing: "bg-amber-400",
  served: "bg-blue-400",
  pending: "bg-gray-400",
  paid: "bg-forest-500",
  cancelled: "bg-red-400",
};

const tabs = ["All", "Pending", "Preparing", "Served", "Paid", "Cancelled"];

function OrderCard({ order }) {
  return (
    <div className="card p-4 flex items-center justify-between gap-3 active:bg-cream-50 cursor-pointer transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center shrink-0">
          <span className="text-forest-400 font-black text-xs">{order.table}</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-forest-900 text-sm">{order.id}</p>
            <span className={`badge text-xs ${statusColors[order.status]}`}>{order.status}</span>
          </div>
          <p className="text-xs text-gray-400 truncate">{order.items} items · {order.server} · {order.time}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-bold text-forest-900">${order.total}</span>
        <ChevronRight size={14} className="text-gray-300" />
      </div>
    </div>
  );
}

export default function Orders() {
  const [tab, setTab] = useState("All");

  const filtered = tab === "All"
    ? orders
    : orders.filter((o) => o.status.toLowerCase() === tab.toLowerCase());

  const counts = tabs.reduce((acc, t) => {
    acc[t] = t === "All" ? orders.length : orders.filter(o => o.status.toLowerCase() === t.toLowerCase()).length;
    return acc;
  }, {});

  return (
    <div className="space-y-4 fade-in">
      {/* Tabs scroll */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 ${tab === t ? "bg-forest-700 text-white" : "bg-white text-gray-600 border border-cream-200 hover:bg-cream-50"}`}>
              {t}
              {counts[t] > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t ? "bg-white/20 text-white" : "bg-cream-100 text-gray-500"}`}>{counts[t]}</span>}
            </button>
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"><RefreshCw size={13} /><span className="hidden sm:inline">Refresh</span></button>
          <button className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"><Plus size={13} /><span className="hidden sm:inline">New Order</span></button>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden space-y-2.5">
        {filtered.map((order) => <OrderCard key={order.id} order={order} />)}
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No orders found.</div>}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead className="border-b border-cream-200">
              <tr>
                <th className="table-th">Order ID</th>
                <th className="table-th">Table</th>
                <th className="table-th">Items</th>
                <th className="table-th text-right">Total</th>
                <th className="table-th">Server</th>
                <th className="table-th">Time</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-cream-50/60 transition-colors cursor-pointer">
                  <td className="table-td font-semibold text-forest-900 text-sm">{order.id}</td>
                  <td className="table-td"><span className="bg-forest-900 text-forest-300 text-xs font-bold px-2 py-1 rounded-lg">{order.table}</span></td>
                  <td className="table-td text-gray-500 text-sm">{order.items} items</td>
                  <td className="table-td text-right font-bold text-forest-800">${order.total}</td>
                  <td className="table-td text-gray-500 text-sm">{order.server}</td>
                  <td className="table-td text-gray-400 text-sm">{order.time}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[order.status]}`}></span>
                      <span className={`badge capitalize ${statusColors[order.status]}`}>{order.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400 text-sm">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
