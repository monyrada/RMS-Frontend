import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Search, X, ChevronLeft, Star, Clock, Flame } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { customerCategories, customerMenuItems } from "../../data/customerData";

function ItemModal({ item, qty, onAdd, onRemove, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 slide-up z-10" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-gray-500 hover:bg-cream-200">
          <X size={16} />
        </button>
        <div className="w-20 h-20 bg-gradient-to-br from-forest-900 to-forest-800 rounded-2xl flex items-center justify-center text-5xl mb-4">
          {item.emoji}
        </div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="text-xl font-black text-forest-900">{item.name}</h2>
          <span className="text-xl font-black text-forest-700 shrink-0">${item.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1"><Clock size={12} className="text-gray-400" /><span className="text-xs text-gray-400">{item.time}</span></div>
          {item.popular && <div className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /><span className="text-xs text-amber-600 font-semibold">Popular</span></div>}
          {item.spicy && <div className="flex items-center gap-1"><Flame size={12} className="text-red-400" /><span className="text-xs text-red-500 font-semibold">Spicy</span></div>}
        </div>
        <p className="text-gray-500 text-sm leading-relaxed mb-5">{item.description}</p>
        {qty === 0 ? (
          <button onClick={() => { onAdd(item); onClose(); }} className="w-full bg-forest-700 hover:bg-forest-600 active:scale-95 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2">
            <Plus size={18} /> Add to Order
          </button>
        ) : (
          <div className="flex items-center justify-between bg-forest-50 rounded-2xl p-2">
            <button onClick={() => onRemove(item.id)} className="w-11 h-11 rounded-xl bg-white border border-forest-200 text-forest-700 hover:bg-forest-100 flex items-center justify-center active:scale-90 transition-all"><Minus size={16} /></button>
            <span className="font-black text-forest-900 text-xl">{qty}</span>
            <button onClick={() => onAdd(item)} className="w-11 h-11 rounded-xl bg-forest-700 text-white hover:bg-forest-600 flex items-center justify-center active:scale-90 transition-all"><Plus size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemCard({ item, qty, onAdd, onRemove, onOpen }) {
  return (
    <div className="menu-card fade-in" onClick={() => onOpen(item)}>
      <div className="h-28 sm:h-32 bg-gradient-to-br from-forest-900 to-forest-800 flex items-center justify-center text-5xl relative">
        {item.emoji}
        {item.popular && <span className="absolute top-2 left-2 bg-amber-rms text-forest-950 text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-1"><Star size={9} />Popular</span>}
        {item.spicy && <span className="absolute top-2 right-2 text-sm">🌶️</span>}
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="font-bold text-forest-900 text-sm leading-tight line-clamp-2">{item.name}</h3>
          <span className="text-forest-700 font-black text-sm whitespace-nowrap ml-1">${item.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1 mb-3">
          <Clock size={10} className="text-gray-400" />
          <span className="text-xs text-gray-400">{item.time}</span>
        </div>
        {qty === 0 ? (
          <button onClick={(e) => { e.stopPropagation(); onAdd(item); }}
            className="w-full flex items-center justify-center gap-1.5 bg-forest-700 hover:bg-forest-600 active:scale-95 text-white font-semibold py-2 rounded-xl transition-all text-sm">
            <Plus size={14} /> Add
          </button>
        ) : (
          <div className="flex items-center justify-between bg-forest-50 rounded-xl p-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onRemove(item.id)} className="w-8 h-8 rounded-lg bg-white border border-forest-200 text-forest-700 hover:bg-forest-100 flex items-center justify-center active:scale-90 transition-all"><Minus size={13} /></button>
            <span className="font-black text-forest-900 text-base w-6 text-center">{qty}</span>
            <button onClick={() => onAdd(item)} className="w-8 h-8 rounded-lg bg-forest-700 text-white hover:bg-forest-600 flex items-center justify-center active:scale-90 transition-all"><Plus size={13} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerMenu() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const { cart, dispatch, count, total } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tableId = params.get("table") || cart.tableId;
  const catRef = useRef(null);

  const getQty = (id) => cart.items.find((i) => i.id === id)?.qty || 0;
  const handleAdd = (item) => dispatch({ type: "ADD", item });
  const handleRemove = (id) => dispatch({ type: "UPDATE_QTY", id, qty: getQty(id) - 1 });

  const filtered = customerMenuItems.filter((item) => {
    const matchCat = activeCategory === "all" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-cream-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-forest-700 transition-colors shrink-0">
              <ChevronLeft size={20} />
            </button>
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search dishes…"
                className="w-full pl-9 pr-9 py-2.5 bg-cream-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-forest-300 border border-cream-200 transition-all" />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14} /></button>}
            </div>
            {tableId && <span className="text-xs bg-forest-100 text-forest-700 px-2.5 py-1.5 rounded-xl font-bold shrink-0">{tableId}</span>}
          </div>
        </div>

        {/* Category tabs */}
        <div ref={catRef} className="flex gap-2 overflow-x-auto px-4 sm:px-6 py-2 scrollbar-none max-w-4xl mx-auto">
          {customerCategories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95 ${activeCategory === cat.id ? "bg-forest-700 text-white shadow-md shadow-forest-700/20" : "bg-cream-50 text-gray-600 border border-cream-200"}`}>
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          {/* Section title */}
          {!search && (
            <div className="mb-4">
              <h2 className="font-black text-forest-900 text-lg">
                {customerCategories.find(c => c.id === activeCategory)?.label}
              </h2>
              <p className="text-xs text-gray-400">{filtered.length} items available</p>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-semibold text-forest-900">No items found</p>
              <p className="text-sm text-gray-400 mt-1">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map((item) => (
                <ItemCard key={item.id} item={item} qty={getQty(item.id)}
                  onAdd={handleAdd} onRemove={handleRemove} onOpen={setModal} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Cart Bar */}
      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-cream-50 via-cream-50/95 to-transparent pt-8">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate(`/cart${tableId ? `?table=${tableId}` : ""}`)}
              className="w-full flex items-center justify-between bg-forest-900 hover:bg-forest-800 active:scale-95 text-white px-5 py-4 rounded-2xl transition-all shadow-2xl shadow-forest-900/40">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart size={20} />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-rms text-forest-950 text-xs font-black rounded-full flex items-center justify-center">{count}</span>
                </div>
                <span className="font-bold text-sm sm:text-base">View Order · {count} item{count > 1 ? "s" : ""}</span>
              </div>
              <span className="font-black text-amber-rms text-base">${total.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {modal && (
        <ItemModal item={modal} qty={getQty(modal.id)}
          onAdd={handleAdd} onRemove={handleRemove} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
