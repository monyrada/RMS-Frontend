import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, Loader2, Receipt } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { getOrderById } from "../../api/order/order.api";
import { getOrderHistory } from "../../utils/orderHistory";
import { orderStatusConfig } from "../../components/common/order/orderStatus";

function summarizeItems(items) {
  if (!items || items.length === 0) return "Order";

  const first = items[0].qty > 1 ? `${items[0].name} ×${items[0].qty}` : items[0].name;
  if (items.length === 1) return first;

  return `${first} +${items.length - 1} more`;
}

function formatWhen(iso) {
  const date = new Date(iso);
  if (!iso || Number.isNaN(date.getTime())) return "";

  const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;

  return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
}

/**
 * Lists orders placed from this device (tracked in localStorage — there's no
 * customer login), refreshed against the server on load so statuses aren't stale.
 */
export default function OrderHistory() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [params] = useSearchParams();
  const tableId = params.get("tableId") || cart.tableId;
  const tableLabel = cart.tableNumber || tableId;

  const savedEntries = useMemo(() => getOrderHistory(tableId), [tableId]);
  const [freshById, setFreshById] = useState({});
  const [completedFor, setCompletedFor] = useState(null);
  const refreshing = savedEntries.length > 0 && completedFor !== savedEntries;

  useEffect(() => {
    if (savedEntries.length === 0) return undefined;

    let cancelled = false;

    Promise.allSettled(savedEntries.map((entry) => getOrderById(entry.id))).then((results) => {
      if (cancelled) return;

      const next = {};
      results.forEach((result, index) => {
        const fresh = result.status === "fulfilled" ? result.value?.data?.data : null;
        if (fresh) next[savedEntries[index].id] = fresh;
      });

      setFreshById((prev) => ({ ...prev, ...next }));
      setCompletedFor(savedEntries);
    });

    return () => {
      cancelled = true;
    };
  }, [savedEntries]);

  const orders = savedEntries.map((entry) => {
    const fresh = freshById[entry.id];
    if (!fresh) return entry;

    return {
      ...entry,
      status: fresh.status,
      total: fresh.totalAmount ?? entry.total,
      itemCount: fresh.items?.length ?? entry.itemCount,
      items: fresh.items?.length ? fresh.items.map((item) => ({ name: item.menuName, qty: item.quantity })) : entry.items,
    };
  });

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="sticky top-0 z-30 border-b border-cream-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-cream-100 hover:text-forest-700"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-forest-900">Order History</h1>
            <p className="text-xs text-gray-500">
              {orders.length} order{orders.length === 1 ? "" : "s"} on this device
            </p>
          </div>
          {tableId && <span className="rounded-lg bg-forest-100 px-2.5 py-2 text-xs font-bold text-forest-700">Table {tableLabel}</span>}
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 py-5 sm:px-6">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-cream-200 bg-white px-6 py-14 text-center">
            <Receipt size={34} className="mx-auto mb-3 text-forest-300" />
            <p className="font-semibold text-forest-900">No orders yet</p>
            <p className="mt-1 text-sm text-gray-500">Orders you place from this device will show up here.</p>
            <button onClick={() => navigate(`/menu${tableId ? `?tableId=${tableId}` : ""}`)} className="btn-secondary mt-5">
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((entry) => {
              const config = orderStatusConfig(entry.status);

              return (
                <button
                  key={entry.id}
                  onClick={() => navigate(`/order-confirm?orderId=${entry.id}${tableId ? `&tableId=${tableId}` : ""}`)}
                  className="card flex w-full items-center justify-between gap-3 p-4 text-left transition-transform active:scale-[0.99]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-forest-900">{summarizeItems(entry.items)}</p>
                      {entry.status ? (
                        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${config.border} ${config.bg} ${config.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                          {config.label}
                        </span>
                      ) : (
                        refreshing && <Loader2 size={12} className="shrink-0 animate-spin text-gray-400" />
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11} />
                      {formatWhen(entry.createdAt)} · {entry.itemCount} item{entry.itemCount === 1 ? "" : "s"}
                      {entry.orderNumber ? ` · ${entry.orderNumber}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-black text-forest-900">${Number(entry.total).toFixed(2)}</span>
                    <ChevronRight size={16} className="text-forest-400" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
