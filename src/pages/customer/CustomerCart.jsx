import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Beef,
  CakeSlice,
  ChevronLeft,
  ChevronRight,
  Fish,
  GlassWater,
  Leaf,
  Loader2,
  MessageSquare,
  Minus,
  Plus,
  Salad,
  Sandwich,
  ShoppingBag,
  Soup,
  Sparkles,
  Trash2,
  Utensils,
  Wheat,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../components/ui/Toast";
import { createOrder } from "../../api/order/order.api";
import { recordOrder } from "../../utils/orderHistory";

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

function CartItemIcon({ item }) {
  const Icon = iconMap[item.icon] || Utensils;

  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent || "from-cream-100 to-forest-300/30"}`}>
      <Icon size={22} className="text-forest-800" strokeWidth={1.8} />
    </div>
  );
}

function KhmerText({ children, className = "" }) {
  if (!children) return null;

  return <p className={`font-sans leading-relaxed ${className}`}>{children}</p>;
}

export default function CustomerCart() {
  const { cart, dispatch, total, count } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const tableId = params.get("tableId") || cart.tableId;
  const tableLabel = cart.tableNumber || tableId;
  const [note, setNote] = useState(cart.note || "");
  const [submitting, setSubmitting] = useState(false);

  const handleQty = (id, qty) => dispatch({ type: "UPDATE_QTY", id, qty });
  const handleRemove = (id) => dispatch({ type: "REMOVE", id });

  const tax = total * 0.1;
  const grandTotal = total + tax;

  const handlePlaceOrder = async () => {
    if (submitting) return;

    if (!tableId) {
      toast.error("No table selected", "Please scan the QR code on your table again.");
      return;
    }

    const cartSnapshot = cart.items;

    try {
      setSubmitting(true);
      dispatch({ type: "SET_NOTE", note });

      const res = await createOrder({
        tableId,
        orderType: "DINE_IN",
        source: "CUSTOMER_QR",
        note,
        tax: Number(tax.toFixed(2)),
        items: cartSnapshot.map((item) => ({ menuId: item.id, quantity: item.qty })),
      });

      const order = res?.data?.data;
      toast.success("Order placed", `Your order ${order?.orderNumber ? `(${order.orderNumber}) ` : ""}has been sent to the kitchen.`);
      recordOrder({
        id: order?.id,
        orderNumber: order?.orderNumber,
        tableId,
        tableNumber: tableLabel,
        total: order?.totalAmount ?? grandTotal,
        itemCount: count,
        items: cartSnapshot.map((item) => ({ name: item.name, qty: item.qty, unitPrice: item.price })),
        status: order?.status,
        note,
      });
      dispatch({ type: "CLEAR" });
      navigate(`/order-confirm${tableId ? `?tableId=${tableId}` : ""}`, {
        state: { order, cartSnapshot },
      });
    } catch (err) {
      toast.error(
        "Could not place order",
        err?.response?.data?.message || "Please try again in a moment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (count === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream-50 px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
          <ShoppingBag size={28} className="text-forest-700" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-forest-900">Your cart is empty</h2>
        <p className="mb-6 max-w-xs text-sm text-gray-500">Add dishes from the menu before placing an order.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Browse Menu
        </button>
      </div>
    );
  }

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
            <h1 className="text-lg font-black text-forest-900">Your Order</h1>
            <p className="text-xs text-gray-500">{count} item{count > 1 ? "s" : ""} selected</p>
          </div>
          {tableId && <span className="rounded-lg bg-forest-100 px-2.5 py-2 text-xs font-bold text-forest-700">Table {tableLabel}</span>}
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg px-4 py-4 pb-28 sm:px-6">
        <section className="card mb-4 p-4">
          {cart.items.map((item) => (
            <div key={item.id} className="cart-item">
              <CartItemIcon item={item} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-forest-900">{item.name}</p>
                <KhmerText className="truncate text-xs font-semibold text-forest-700">{item.nameKh}</KhmerText>
                <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button onClick={() => handleQty(item.id, item.qty - 1)} className="qty-btn bg-cream-100 text-forest-700 hover:bg-cream-200" aria-label="Decrease quantity">
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-sm font-black">{item.qty}</span>
                <button onClick={() => handleQty(item.id, item.qty + 1)} className="qty-btn bg-forest-700 text-white hover:bg-forest-600" aria-label="Increase quantity">
                  <Plus size={12} />
                </button>
                <button onClick={() => handleRemove(item.id)} className="ml-1 rounded-lg p-2 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500" aria-label="Remove item">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="w-16 shrink-0 text-right">
                <p className="text-sm font-bold text-forest-900">${(item.price * item.qty).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="card mb-4">
          <div className="mb-2 flex items-center gap-2">
            <MessageSquare size={15} className="text-forest-500" />
            <span className="text-sm font-semibold text-forest-900">Special Instructions</span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Allergies, dietary needs, or kitchen notes"
            rows={3}
            className="input resize-none"
          />
        </section>

        <section className="card">
          <h3 className="mb-3 font-bold text-forest-900">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({count} items)</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-cream-200 pt-2 text-base font-black text-forest-900">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-cream-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto max-w-lg">
          <button
            onClick={handlePlaceOrder}
            disabled={submitting}
            className="flex w-full items-center justify-between rounded-xl bg-forest-900 px-6 py-4 font-semibold text-white transition-all hover:bg-forest-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <div className="flex items-center gap-2">
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
              <span>{submitting ? "Placing order..." : "Place Order"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-amber-rms">${grandTotal.toFixed(2)}</span>
              <ChevronRight size={16} className="text-forest-500" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
