import { Download, CreditCard, Banknote, QrCode, ChevronRight } from "lucide-react";
import { payments } from "../../data/mockData";

const methodIcon = { Card: CreditCard, Cash: Banknote, "QR Pay": QrCode };
const statusStyle = {
  completed: "bg-forest-300/20 text-forest-700",
  refunded: "bg-red-100 text-red-600",
  pending: "bg-amber-100 text-amber-700",
};

function PayCard({ pay }) {
  const Icon = methodIcon[pay.method] || CreditCard;
  return (
    <div className="card p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all">
      <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-forest-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-forest-900 text-sm truncate">{pay.id}</p>
          <span className={`badge text-xs shrink-0 ${statusStyle[pay.status]}`}>{pay.status}</span>
        </div>
        <p className="text-xs text-gray-400 truncate">{pay.orderId} · {pay.table} · {pay.cashier} · {pay.time}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-forest-900 text-sm">${pay.amount.toFixed(2)}</p>
        <p className="text-xs text-gray-400">{pay.method}</p>
      </div>
    </div>
  );
}

export default function Payment() {
  const completed = payments.filter((p) => p.status === "completed");
  const total = completed.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-4 fade-in">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Total Collected", value: `$${total.toFixed(2)}`, sub: `${completed.length} transactions` },
          { label: "Card Payments", value: `$${payments.filter(p => p.method === "Card" && p.status === "completed").reduce((s,p)=>s+p.amount,0).toFixed(2)}`, sub: "by card" },
          { label: "Refunds", value: payments.filter(p => p.status === "refunded").length.toString(), sub: "this period", red: true },
        ].map((s) => (
          <div key={s.label} className="card p-3 sm:p-5">
            <p className={`text-xl sm:text-2xl font-bold ${s.red ? "text-red-500" : "text-forest-900"}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</p>
            <p className="text-xs text-gray-400 hidden sm:block">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-forest-900">Transactions</h3>
          <button className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"><Download size={13} /> Export</button>
        </div>
        {payments.map((pay) => <PayCard key={pay.id} pay={pay} />)}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200">
          <h3 className="font-semibold text-forest-900">Transaction History</h3>
          <button className="btn-secondary flex items-center gap-2 text-xs py-1.5"><Download size={13} /> Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="border-b border-cream-200">
              <tr>
                <th className="table-th">Payment ID</th>
                <th className="table-th">Order</th>
                <th className="table-th">Table</th>
                <th className="table-th text-right">Amount</th>
                <th className="table-th">Method</th>
                <th className="table-th">Cashier</th>
                <th className="table-th">Time</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay) => {
                const Icon = methodIcon[pay.method] || CreditCard;
                return (
                  <tr key={pay.id} className="hover:bg-cream-50/60 transition-colors cursor-pointer">
                    <td className="table-td font-semibold text-forest-900 text-sm">{pay.id}</td>
                    <td className="table-td text-gray-500 text-sm">{pay.orderId}</td>
                    <td className="table-td"><span className="bg-forest-900 text-forest-300 text-xs font-bold px-2 py-1 rounded-lg">{pay.table}</span></td>
                    <td className="table-td text-right font-bold text-forest-800">${pay.amount.toFixed(2)}</td>
                    <td className="table-td"><div className="flex items-center gap-1.5 text-gray-600 text-sm"><Icon size={13} />{pay.method}</div></td>
                    <td className="table-td text-gray-500 text-sm">{pay.cashier}</td>
                    <td className="table-td text-gray-400 text-sm">{pay.time}</td>
                    <td className="table-td"><span className={`badge capitalize ${statusStyle[pay.status]}`}>{pay.status}</span></td>
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
