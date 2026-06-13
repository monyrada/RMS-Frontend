import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Plus, Minus, Trash2, ShoppingBag, MessageSquare, ChevronRight } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function CustomerCart() {
  const { cart, dispatch, total, count } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tableId = params.get("table") || cart.tableId;
  const [note, setNote] = useState(cart.note || "");

  const handleQty = (id, qty) => dispatch({ type: "UPDATE_QTY", id, qty });
  const handleRemove = (id) => dispatch({ type: "REMOVE", id });

  const tax = total * 0.1;
  const grandTotal = total + tax;

  const handlePlaceOrder = () => {
    dispatch({ type: "SET_NOTE", note });
    navigate(`/order-confirm${tableId ? `?table=${tableId}` : ""}`);
  };

  if (count === 0) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-bold text-forest-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 text-sm mb-6">Add some dishes from our menu to get started.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-cream-200 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-forest-700 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-black text-forest-900 text-lg flex-1">Your Order</h1>
          {tableId && (
            <span className="text-xs bg-forest-100 text-forest-700 px-2.5 py-1 rounded-full font-semibold">
              Table {tableId}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Items */}
        <div className="px-4 sm:px-6 py-4 max-w-lg mx-auto w-full">
          <div className="card mb-4">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="w-12 h-12 bg-forest-900 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-forest-900 text-sm truncate">{item.name}</p>
                  <p className="text-gray-400 text-xs">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleQty(item.id, item.qty - 1)} className="qty-btn bg-cream-100 text-forest-700 hover:bg-cream-200">
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center font-black text-sm">{item.qty}</span>
                  <button onClick={() => handleQty(item.id, item.qty + 1)} className="qty-btn bg-forest-700 text-white hover:bg-forest-600">
                    <Plus size={12} />
                  </button>
                  <button onClick={() => handleRemove(item.id)} className="ml-1 text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="w-14 text-right shrink-0">
                  <p className="font-bold text-forest-900 text-sm">${(item.price * item.qty).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="card mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={15} className="text-forest-500" />
              <span className="font-semibold text-forest-900 text-sm">Special Instructions</span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Allergies, dietary needs, special requests…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-sm resize-none outline-none focus:border-forest-400 placeholder:text-gray-400 transition-colors"
            />
          </div>

          {/* Summary */}
          <div className="card">
            <h3 className="font-bold text-forest-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({count} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-cream-200 pt-2 flex justify-between font-black text-forest-900 text-base">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Place Order */}
      <div className="sticky bottom-0 bg-white border-t border-cream-200 px-4 sm:px-6 py-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handlePlaceOrder}
            className="w-full flex items-center justify-between bg-forest-900 hover:bg-forest-800 active:scale-95 text-white px-6 py-4 rounded-2xl transition-all font-semibold"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} />
              <span>Place Order</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-rms font-black">${grandTotal.toFixed(2)}</span>
              <ChevronRight size={16} className="text-forest-500" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
