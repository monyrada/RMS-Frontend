import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Clock, ChefHat, Bell } from "lucide-react";
import { useCart } from "../../context/CartContext";

const steps = [
  { icon: CheckCircle, label: "Order Received", done: true, time: "Just now" },
  { icon: ChefHat, label: "Kitchen Preparing", done: false, time: "~15 min" },
  { icon: Bell, label: "Ready to Serve", done: false, time: "Pending" },
];

export default function OrderConfirm() {
  const { cart, dispatch, total } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tableId = params.get("table") || cart.tableId;
  const [orderId] = useState(() => `#ORD-${Math.floor(1000 + Math.random() * 9000)}`);
  const [currentStep, setCurrentStep] = useState(0);

  // Simulate order progress
  useEffect(() => {
    const t = setTimeout(() => setCurrentStep(1), 3000);
    return () => clearTimeout(t);
  }, []);

  const tax = total * 0.1;
  const grandTotal = total + tax;

  const handleNewOrder = () => {
    dispatch({ type: "CLEAR" });
    navigate(`/menu${tableId ? `?table=${tableId}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Success hero */}
      <div className="bg-forest-900 px-6 pt-12 pb-10 text-center">
        <div className="w-20 h-20 bg-forest-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <CheckCircle size={40} className="text-forest-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-black text-white mb-1">Order Placed! 🎉</h1>
        <p className="text-forest-400 text-sm mb-4">
          {tableId ? `Table ${tableId} — ` : ""}{orderId}
        </p>
        <div className="inline-flex items-center gap-2 bg-forest-800 px-4 py-2 rounded-xl">
          <Clock size={14} className="text-amber-rms" />
          <span className="text-white text-sm font-medium">Est. wait: ~15 minutes</span>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 py-5 max-w-lg mx-auto w-full">
        {/* Progress */}
        <div className="card mb-4">
          <h3 className="font-bold text-forest-900 mb-4">Order Status</h3>
          <div className="space-y-4">
            {steps.map((step, i) => {
              const active = i <= currentStep;
              return (
                <div key={step.label} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${active ? "bg-forest-700" : "bg-cream-100"}`}>
                    <step.icon size={18} className={active ? "text-white" : "text-gray-400"} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${active ? "text-forest-900" : "text-gray-400"}`}>{step.label}</p>
                    <p className="text-xs text-gray-400">{step.time}</p>
                  </div>
                  {active && i === currentStep && (
                    <div className="w-2 h-2 bg-forest-500 rounded-full animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order summary */}
        <div className="card mb-4">
          <h3 className="font-bold text-forest-900 mb-3">Your Items</h3>
          <div className="space-y-2">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.emoji}</span>
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-gray-400">×{item.qty}</span>
                </div>
                <span className="font-semibold text-forest-900">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
            {cart.note && (
              <p className="text-xs text-gray-400 mt-2 italic border-t border-cream-100 pt-2">Note: {cart.note}</p>
            )}
            <div className="border-t border-cream-100 pt-2 flex justify-between font-black text-forest-900">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleNewOrder}
          className="w-full btn-secondary py-3.5 text-base rounded-2xl"
        >
          Order More Items
        </button>
      </div>
    </div>
  );
}
