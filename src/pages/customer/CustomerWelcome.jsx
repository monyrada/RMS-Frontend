import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ChefHat, Clock, Leaf, QrCode, Star, Utensils, Wifi } from "lucide-react";
import { useCart } from "../../context/CartContext";

export default function CustomerWelcome() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { dispatch } = useCart();
  const tableId = params.get("table");

  useEffect(() => {
    if (tableId) dispatch({ type: "SET_TABLE", tableId });
  }, [dispatch, tableId]);

  return (
    <div className="min-h-screen bg-forest-950 text-white">
      <header className="mx-auto w-full max-w-lg px-6 pb-4 pt-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-rms shadow-lg shadow-amber-rms/20">
              <Leaf size={20} className="text-forest-950" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-base font-bold leading-none">The Green Table</p>
              <p className="text-xs text-forest-400">Restaurant & Bar</p>
            </div>
          </div>
          <a href="/admin/login" className="text-xs font-medium text-forest-400 transition-colors hover:text-white">
            Staff
          </a>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-lg flex-col px-6 pb-8">
        <section className="flex flex-1 flex-col justify-center py-8">
          <div className="relative mb-7 h-40 overflow-hidden rounded-2xl border border-forest-800 bg-forest-900 shadow-2xl shadow-black/20">
            <div className="absolute left-5 top-5 flex h-14 w-14 items-center justify-center rounded-xl bg-forest-800">
              <ChefHat size={26} className="text-forest-300" />
            </div>
            <div className="absolute bottom-5 right-5 flex h-24 w-24 items-center justify-center rounded-full bg-cream-50 shadow-xl">
              <Utensils size={42} className="text-forest-800" strokeWidth={1.6} />
            </div>
            <div className="absolute bottom-5 left-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-rms">Table ordering</p>
              <p className="mt-1 max-w-[190px] text-sm leading-relaxed text-forest-300">Fresh dishes sent directly to the kitchen.</p>
            </div>
          </div>

          <h1 className="text-3xl font-black leading-tight sm:text-4xl">
            Browse, order, and relax at your table.
          </h1>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-forest-300">
            Choose from the full menu, add notes for the kitchen, and keep your order connected to the right table.
          </p>

          {tableId ? (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-forest-700 bg-forest-900 px-4 py-3">
              <div className="h-2 w-2 rounded-full bg-forest-300" />
              <span className="text-sm text-forest-300">
                Table <strong className="text-white">{tableId}</strong> is ready.
              </span>
            </div>
          ) : (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-rms/30 bg-amber-rms/10 px-4 py-3">
              <QrCode size={17} className="shrink-0 text-amber-rms" />
              <span className="text-sm text-amber-100">Scan the QR code on your table to link an order.</span>
            </div>
          )}

          <button
            onClick={() => navigate(`/menu${tableId ? `?table=${tableId}` : ""}`)}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-amber-rms px-8 py-4 text-base font-black text-forest-950 shadow-xl shadow-amber-rms/20 transition-all hover:bg-amber-light active:scale-[0.99]"
          >
            Browse Menu
            <ArrowRight size={20} />
          </button>
          <p className="mt-3 text-center text-xs text-forest-500">No account needed. Order in seconds.</p>
        </section>

        <section className="grid grid-cols-3 gap-3">
          {[
            { icon: Clock, label: "Fast", sub: "~15 min" },
            { icon: Star, label: "Rated", sub: "4.8 / 5" },
            { icon: Wifi, label: "Wi-Fi", sub: "Free" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="rounded-xl border border-forest-800 bg-forest-900 p-3 text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-forest-800">
                <Icon size={14} className="text-forest-300" />
              </div>
              <p className="text-xs font-semibold">{label}</p>
              <p className="text-xs text-forest-500">{sub}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
