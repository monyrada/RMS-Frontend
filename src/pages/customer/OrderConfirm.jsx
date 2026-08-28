import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Beef,
  Bell,
  CakeSlice,
  CheckCircle,
  ChefHat,
  Clock,
  Fish,
  GlassWater,
  Leaf,
  Salad,
  Sandwich,
  Soup,
  Sparkles,
  Utensils,
  Wheat,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

const steps = [
  { icon: CheckCircle, label: "Order Received", time: "Just now" },
  { icon: ChefHat, label: "Kitchen Preparing", time: "~15 min" },
  { icon: Bell, label: "Ready to Serve", time: "Pending" },
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

export default function OrderConfirm() {
  const { cart, dispatch, total } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tableId = params.get("table") || cart.tableId;
  const [orderId] = useState(() => `#ORD-${Math.floor(1000 + Math.random() * 9000)}`);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setCurrentStep(1), 3000);
    return () => clearTimeout(timer);
  }, []);

  const tax = total * 0.1;
  const grandTotal = total + tax;

  const handleNewOrder = () => {
    dispatch({ type: "CLEAR" });
    navigate(`/menu${tableId ? `?table=${tableId}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <section className="bg-forest-900 px-6 pb-9 pt-12 text-center text-white">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-forest-800 shadow-xl">
          <CheckCircle size={40} className="text-forest-300" strokeWidth={1.7} />
        </div>
        <h1 className="mb-1 text-2xl font-black">Order Placed</h1>
        <p className="mb-4 text-sm text-forest-400">
          {tableId ? `Table ${tableId} | ` : ""}
          {orderId}
        </p>
        <div className="inline-flex items-center gap-2 rounded-xl bg-forest-800 px-4 py-2">
          <Clock size={14} className="text-amber-rms" />
          <span className="text-sm font-medium">Est. wait: ~15 minutes</span>
        </div>
      </section>

      <main className="mx-auto w-full max-w-lg px-4 py-5 sm:px-6">
        <section className="card mb-4">
          <h3 className="mb-4 font-bold text-forest-900">Order Status</h3>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const active = index <= currentStep;
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
                  {active && index === currentStep && <div className="h-2 w-2 rounded-full bg-forest-500" />}
                </div>
              );
            })}
          </div>
        </section>

        <section className="card mb-4">
          <h3 className="mb-3 font-bold text-forest-900">Your Items</h3>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2.5">
                  <SummaryIcon item={item} />
                  <div className="min-w-0">
                    <p className="truncate text-gray-700">{item.name}</p>
                    <KhmerText className="truncate text-xs font-semibold text-forest-700">{item.nameKh}</KhmerText>
                    <p className="text-xs text-gray-400">Qty {item.qty}</p>
                  </div>
                </div>
                <span className="shrink-0 font-semibold text-forest-900">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
            {cart.note && <p className="border-t border-cream-100 pt-3 text-xs leading-relaxed text-gray-500">Note: {cart.note}</p>}
            <div className="flex justify-between border-t border-cream-100 pt-3 font-black text-forest-900">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <button onClick={handleNewOrder} className="btn-secondary w-full rounded-xl py-3.5 text-base">
          Order More Items
        </button>
      </main>
    </div>
  );
}
