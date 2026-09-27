import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Beef,
  Bell,
  CakeSlice,
  CheckCircle,
  ChefHat,
  Clock,
  Fish,
  GlassWater,
  Leaf,
  Loader2,
  Salad,
  Sandwich,
  Soup,
  Sparkles,
  Utensils,
  Wheat,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { getOrderById } from "../../api/order/order.api";

const POLL_MS = 8000;
const LAST_ORDER_KEY = "rms_last_order_id";
const TERMINAL_STATUSES = ["SERVED", "COMPLETED", "CANCELLED"];

const STEP_DEFS = [
  { statuses: ["PENDING", "CONFIRMED"], icon: CheckCircle, label: "Order Received", time: "Just now" },
  { statuses: ["PREPARING"], icon: ChefHat, label: "Kitchen Preparing", time: "~15 min" },
  { statuses: ["READY"], icon: Bell, label: "Ready to Serve", time: "Pending" },
  { statuses: ["SERVED", "COMPLETED"], icon: CheckCircle, label: "Served", time: "Pending" },
];

const iconMap = {
  Beef,
  CakeSlice,
  Dessert: CakeSlice,
  Fish,
  GlassWater,
  Leaf,
  Milk: GlassWater,
  Salad,
  Sandwich,
  Soup,
  Sparkles,
  Utensils,
  Wheat,
};

function currentStepIndex(status) {
  const index = STEP_DEFS.findIndex((step) => step.statuses.includes(status));
  return index === -1 ? 0 : index;
}

function SummaryIcon({ item }) {
  const Icon = iconMap[item.icon] || Utensils;

  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.accent || "from-cream-100 to-forest-300/30"}`}>
      <Icon size={15} className="text-forest-800" />
    </span>
  );
}

function KhmerText({ children, className = "" }) {
  if (!children) return null;

  return <p className={`font-sans leading-relaxed ${className}`}>{children}</p>;
}

/** Merges the server's authoritative item data with the local cart snapshot's visuals (icon/accent/Khmer name). */
function mergeItems(order, cartSnapshot) {
  const serverItems = order?.items || [];
  if (serverItems.length === 0) return cartSnapshot;

  return serverItems.map((item) => {
    const visual = cartSnapshot.find((c) => c.id === item.menuId);
    return {
      id: item.id,
      name: item.menuName || visual?.name || "Item",
      nameKh: visual?.nameKh,
      qty: item.quantity,
      price: item.unitPrice,
      subtotal: item.subtotal,
      icon: visual?.icon,
      accent: visual?.accent,
    };
  });
}

export default function OrderConfirm() {
  const { cart, dispatch, total: cartTotal } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const tableId = params.get("tableId") || cart.tableId;
  const tableLabel = cart.tableNumber || tableId;

  const [order, setOrder] = useState(location.state?.order || null);
  const [cartSnapshot] = useState(location.state?.cartSnapshot || cart.items);
  const [initialOrderId] = useState(
    () => location.state?.order?.id || params.get("orderId") || sessionStorage.getItem(LAST_ORDER_KEY)
  );
  const [loading, setLoading] = useState(!location.state?.order && !!initialOrderId);
  const [notFound, setNotFound] = useState(!location.state?.order && !initialOrderId);
  const pollTimer = useRef(null);

  // Load the order if we landed here without router state (e.g. a page refresh).
  useEffect(() => {
    if (order) {
      sessionStorage.setItem(LAST_ORDER_KEY, order.id);
      return;
    }

    if (!initialOrderId) return;

    getOrderById(initialOrderId)
      .then((res) => setOrder(res?.data?.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll for kitchen status updates until the order reaches a terminal state.
  useEffect(() => {
    if (!order?.id || TERMINAL_STATUSES.includes(order.status)) return;

    pollTimer.current = setInterval(async () => {
      try {
        const res = await getOrderById(order.id);
        setOrder(res?.data?.data);
      } catch {
        // stay on the last known state; next tick retries
      }
    }, POLL_MS);

    return () => clearInterval(pollTimer.current);
  }, [order?.id, order?.status]);

  const handleNewOrder = () => {
    dispatch({ type: "CLEAR" });
    sessionStorage.removeItem(LAST_ORDER_KEY);
    navigate(`/menu${tableId ? `?tableId=${tableId}` : ""}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream-50 px-6 text-center">
        <Loader2 size={28} className="animate-spin text-forest-700" />
        <p className="text-sm text-gray-500">Loading your order...</p>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream-50 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
          <AlertTriangle size={28} className="text-amber-rms" />
        </div>
        <div>
          <h2 className="mb-1 text-xl font-bold text-forest-900">Order not found</h2>
          <p className="max-w-xs text-sm text-gray-500">We couldn't find that order. Try browsing the menu again.</p>
        </div>
        <button onClick={() => navigate(`/menu${tableId ? `?tableId=${tableId}` : ""}`)} className="btn-secondary">
          Browse Menu
        </button>
      </div>
    );
  }

  const items = mergeItems(order, cartSnapshot);
  const isCancelled = order.status === "CANCELLED";
  const stepIndex = currentStepIndex(order.status);
  const total = Number(order.totalAmount ?? cartTotal);
  const subtotal = Number(order.subtotal ?? cartTotal);
  const tax = Number(order.tax ?? 0);
  const discount = Number(order.discount ?? 0);

  return (
    <div className="min-h-screen bg-cream-50">
      <section className={`px-6 pb-9 pt-12 text-center text-white ${isCancelled ? "bg-red-900" : "bg-forest-900"}`}>
        <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl shadow-xl ${isCancelled ? "bg-red-800" : "bg-forest-800"}`}>
          {isCancelled ? (
            <AlertTriangle size={40} className="text-red-200" strokeWidth={1.7} />
          ) : (
            <CheckCircle size={40} className="text-forest-300" strokeWidth={1.7} />
          )}
        </div>
        <h1 className="mb-1 text-2xl font-black">{isCancelled ? "Order Cancelled" : "Order Placed"}</h1>
        <p className={`mb-4 text-sm ${isCancelled ? "text-red-300" : "text-forest-400"}`}>
          {tableId ? `Table ${tableLabel} | ` : ""}
          {order.orderNumber}
        </p>
        {!isCancelled && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-forest-800 px-4 py-2">
            <Clock size={14} className="text-amber-rms" />
            <span className="text-sm font-medium">Est. wait: ~15 minutes</span>
          </div>
        )}
      </section>

      <main className="mx-auto w-full max-w-lg px-4 py-5 sm:px-6">
        {!isCancelled && (
          <section className="card mb-4">
            <h3 className="mb-4 font-bold text-forest-900">Order Status</h3>
            <div className="space-y-4">
              {STEP_DEFS.map((step, index) => {
                const active = index <= stepIndex;
                const Icon = step.icon;

                return (
                  <div key={step.label} className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${active ? "bg-forest-700" : "bg-cream-100"}`}>
                      <Icon size={18} className={active ? "text-white" : "text-gray-400"} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${active ? "text-forest-900" : "text-gray-400"}`}>{step.label}</p>
                      <p className="text-xs text-gray-400">{step.time}</p>
                    </div>
                    {active && index === stepIndex && <div className="h-2 w-2 animate-pulse rounded-full bg-forest-500" />}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="card mb-4">
          <h3 className="mb-3 font-bold text-forest-900">Your Items</h3>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id ?? index} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2.5">
                  <SummaryIcon item={item} />
                  <div className="min-w-0">
                    <p className="truncate text-gray-700">{item.name}</p>
                    <KhmerText className="truncate text-xs font-semibold text-forest-700">{item.nameKh}</KhmerText>
                    <p className="text-xs text-gray-400">Qty {item.qty}</p>
                  </div>
                </div>
                <span className="shrink-0 font-semibold text-forest-900">${(Number(item.price) * Number(item.qty)).toFixed(2)}</span>
              </div>
            ))}
            {order.note && <p className="border-t border-cream-100 pt-3 text-xs leading-relaxed text-gray-500">Note: {order.note}</p>}
            <div className="space-y-1 border-t border-cream-100 pt-3 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-forest-700">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between border-t border-cream-100 pt-3 font-black text-forest-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <button onClick={handleNewOrder} className="btn-secondary w-full rounded-xl py-3.5 text-base">
          Order More Items
        </button>
        <button
          onClick={() => navigate(`/orders${tableId ? `?tableId=${tableId}` : ""}`)}
          className="mt-3 w-full rounded-xl py-2.5 text-center text-sm font-semibold text-forest-700 transition-colors hover:text-forest-900"
        >
          View Order History
        </button>
      </main>
    </div>
  );
}
