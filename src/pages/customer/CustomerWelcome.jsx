import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { Leaf, QrCode, ArrowRight, Clock, Star, Wifi, ChefHat } from "lucide-react";
import { useEffect } from "react";

export default function CustomerWelcome() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { dispatch } = useCart();
  const tableId = params.get("table");

  useEffect(() => {
    if (tableId) dispatch({ type: "SET_TABLE", tableId });
  }, []);

  return (
    <div className="min-h-screen bg-forest-950 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-rms rounded-xl flex items-center justify-center shadow-lg shadow-amber-rms/30">
              <Leaf size={20} className="text-forest-950" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">The Green Table</p>
              <p className="text-forest-400 text-xs">Restaurant & Bar</p>
            </div>
          </div>
          <a href="/admin/login" className="text-forest-500 hover:text-forest-400 text-xs transition-colors">Staff →</a>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 text-center max-w-lg mx-auto w-full">
        {/* Animated dish */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-forest-800 rounded-3xl flex items-center justify-center text-6xl shadow-2xl">🍽️</div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-rms rounded-full flex items-center justify-center">
            <ChefHat size={14} className="text-forest-950" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
          Ready to order?<br />
          <span className="text-amber-rms">We've got you.</span>
        </h1>
        <p className="text-forest-400 text-base mb-6 leading-relaxed max-w-xs">
          Browse our full menu, customize your order, and we'll serve it fresh to your table.
        </p>

        {/* Table indicator */}
        {tableId ? (
          <div className="mb-6 flex items-center gap-2 bg-forest-800 border border-forest-700 px-4 py-3 rounded-2xl">
            <div className="w-2 h-2 bg-forest-400 rounded-full animate-pulse"></div>
            <span className="text-forest-300 text-sm">Table <strong className="text-white">{tableId}</strong> — ready to order</span>
          </div>
        ) : (
          <div className="mb-6 flex items-center gap-2 bg-amber-rms/10 border border-amber-rms/30 px-4 py-3 rounded-2xl max-w-xs">
            <QrCode size={16} className="text-amber-rms shrink-0" />
            <span className="text-amber-300 text-sm text-left">Scan the QR code on your table to link your order</span>
          </div>
        )}

        <button
          onClick={() => navigate(`/menu${tableId ? `?table=${tableId}` : ""}`)}
          className="flex items-center gap-3 bg-amber-rms hover:bg-amber-light active:scale-95 text-forest-950 font-black text-base px-8 py-4 rounded-2xl transition-all shadow-xl shadow-amber-rms/30 cart-pulse mb-3"
        >
          Browse Menu <ArrowRight size={20} />
        </button>
        <p className="text-forest-600 text-xs">No account needed · Order in seconds</p>
      </div>

      {/* Stats bar */}
      <div className="max-w-lg mx-auto w-full px-6 pb-10">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Clock, label: "Fast Service", sub: "~15 min avg" },
            { icon: Star, label: "Top Rated", sub: "4.8 / 5.0" },
            { icon: Wifi, label: "Free Wi-Fi", sub: "GreenTable5G" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="bg-forest-900 rounded-2xl p-3 text-center">
              <div className="w-8 h-8 bg-forest-800 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Icon size={14} className="text-forest-400" />
              </div>
              <p className="text-white text-xs font-semibold">{label}</p>
              <p className="text-forest-500 text-xs">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
