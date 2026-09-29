import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Beef,
  CakeSlice,
  ChevronLeft,
  Clock,
  Flame,
  Fish,
  GlassWater,
  Leaf,
  Milk,
  Minus,
  Plus,
  Salad,
  Sandwich,
  Search,
  ShoppingCart,
  Soup,
  Sparkles,
  Star,
  Utensils,
  Wheat,
  X,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { getCategories } from "../../api/menu/category.api";
import { getMenus } from "../../api/menu/item.api";
import { useTableScan } from "../../hooks/useTableScan";

const DEBOUNCE_MS = 300;

const iconMap = {
  Beef,
  CakeSlice,
  Dessert: CakeSlice,
  Fish,
  GlassWater,
  Leaf,
  Milk,
  Salad,
  Sandwich,
  Soup,
  Sparkles,
  Utensils,
  Wheat,
};

const categoryIconMap = [
  { keywords: ["drink", "beverage", "coffee", "tea", "juice", "water"], icon: "GlassWater" },
  { keywords: ["dessert", "cake", "sweet", "pastry"], icon: "CakeSlice" },
  { keywords: ["starter", "salad", "appetizer"], icon: "Salad" },
  { keywords: ["special", "chef"], icon: "Sparkles" },
  { keywords: ["beef", "steak", "main"], icon: "Beef" },
];

const itemVisualMap = [
  { keywords: ["salmon", "fish", "seafood"], icon: "Fish", accent: "from-sky-100 to-emerald-100" },
  { keywords: ["salad", "vegetable"], icon: "Salad", accent: "from-lime-100 to-forest-300/40" },
  { keywords: ["burger", "sandwich"], icon: "Sandwich", accent: "from-amber-100 to-orange-100" },
  { keywords: ["cake", "tiramisu", "dessert", "chocolate"], icon: "CakeSlice", accent: "from-rose-100 to-stone-100" },
  { keywords: ["drink", "mojito", "juice", "water", "coffee", "tea"], icon: "GlassWater", accent: "from-cyan-100 to-lime-100" },
  { keywords: ["soup", "tom yum"], icon: "Soup", accent: "from-red-100 to-amber-100" },
  { keywords: ["mushroom", "risotto", "rice"], icon: "Wheat", accent: "from-cream-200 to-lime-100" },
  { keywords: ["special", "platter", "chef"], icon: "Sparkles", accent: "from-amber-100 to-forest-300/30" },
  { keywords: ["roll", "herb"], icon: "Leaf", accent: "from-green-100 to-amber-100" },
  { keywords: ["beef", "steak"], icon: "Beef", accent: "from-amber-100 to-orange-100" },
];

function pickCategoryIcon(category) {
  const text = `${category?.name || ""} ${category?.code || ""}`.toLowerCase();
  return categoryIconMap.find((entry) => entry.keywords.some((keyword) => text.includes(keyword)))?.icon || "Utensils";
}

function pickItemVisual(item) {
  const text = `${item?.name || ""} ${item?.categoryName || ""} ${item?.description || ""}`.toLowerCase();
  return itemVisualMap.find((entry) => entry.keywords.some((keyword) => text.includes(keyword))) || { icon: "Utensils", accent: "from-cream-200 to-forest-300/30" };
}

function normalizeItem(item) {
  const visual = pickItemVisual(item);

  return {
    ...item,
    id: item.id,
    name: item.name || "Untitled item",
    nameKh: item.nameKh || "",
    description: item.description || "No description available.",
    descriptionKh: item.descriptionKh || "",
    categoryName: item.categoryName || "",
    categoryNameKh: item.categoryNameKh || "",
    price: Number(item.price || 0),
    time: item.preparationTime || item.time || "15 min",
    popular: Boolean(item.popular || item.isPopular),
    spicy: Boolean(item.spicy || item.isSpicy),
    icon: item.icon || visual.icon,
    accent: item.accent || visual.accent,
    status: item.status,
  };
}

function normalizeCategory(category) {
  return {
    ...category,
    id: category.id,
    label: category.name || "Untitled",
    labelKh: category.nameKh || "",
    icon: pickCategoryIcon(category),
  };
}

function FoodVisual({ item, size = "md" }) {
  const Icon = iconMap[item.icon] || Utensils;
  const visualSize = size === "lg" ? "h-28" : "h-32";
  const iconSize = size === "lg" ? 42 : 34;

  if (item.imageUrl) {
    return (
      <div className={`${visualSize} bg-cream-100`}>
        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${visualSize} bg-gradient-to-br ${item.accent} relative flex items-center justify-center`}>
      <div className="absolute inset-x-4 top-4 h-px bg-white/70" />
      <div className="rounded-full bg-white/80 p-4 shadow-sm ring-1 ring-white">
        <Icon size={iconSize} className="text-forest-800" strokeWidth={1.7} />
      </div>
    </div>
  );
}

function ItemTags({ item }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 rounded-full bg-cream-50 px-2 py-1 text-xs font-medium text-gray-500">
        <Clock size={11} />
        {item.time}
      </span>
      {item.popular && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-rms/15 px-2 py-1 text-xs font-semibold text-amber-700">
          <Star size={11} className="fill-amber-rms text-amber-rms" />
          Popular
        </span>
      )}
      {item.spicy && (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
          <Flame size={11} />
          Spicy
        </span>
      )}
    </div>
  );
}

function KhmerText({ children, className = "" }) {
  if (!children) return null;

  return <p className={`font-sans leading-relaxed ${className}`}>{children}</p>;
}

function ItemModal({ item, qty, onAdd, onRemove, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-forest-950/55 backdrop-blur-sm" />
      <div
        className="slide-up relative z-10 w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-gray-500 shadow-sm transition-colors hover:bg-cream-100"
          aria-label="Close item details"
        >
          <X size={17} />
        </button>
        <FoodVisual item={item} size="lg" />
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black leading-tight text-forest-900">{item.name}</h2>
              <KhmerText className="mt-1 text-sm font-semibold text-forest-700">{item.nameKh}</KhmerText>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{item.description}</p>
              <KhmerText className="mt-1 text-sm text-gray-500">{item.descriptionKh}</KhmerText>
            </div>
            <span className="shrink-0 text-xl font-black text-forest-700">${item.price.toFixed(2)}</span>
          </div>
          <ItemTags item={item} />

          {qty === 0 ? (
            <button
              onClick={() => {
                onAdd(item);
                onClose();
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-700 py-3.5 font-bold text-white transition-all hover:bg-forest-600 active:scale-[0.98]"
            >
              <Plus size={18} />
              Add to Order
            </button>
          ) : (
            <div className="mt-5 flex items-center justify-between rounded-xl bg-cream-50 p-2">
              <button onClick={() => onRemove(item.id)} className="qty-btn bg-white text-forest-700 shadow-sm hover:bg-cream-100" aria-label="Decrease quantity">
                <Minus size={16} />
              </button>
              <span className="text-xl font-black text-forest-900">{qty}</span>
              <button onClick={() => onAdd(item)} className="qty-btn bg-forest-700 text-white hover:bg-forest-600" aria-label="Increase quantity">
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemCard({ item, qty, onAdd, onRemove, onOpen }) {
  const Icon = iconMap[item.icon] || Utensils;

  return (
    <article
      className="fade-in group cursor-pointer overflow-hidden rounded-2xl border border-cream-200 bg-white p-2.5 shadow-md transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
      onClick={() => onOpen(item)}
    >
      <div className={`relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br ${item.accent}`}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="flex h-full w-full items-center justify-center transition-transform duration-500 group-hover:scale-110">
            <div className="rounded-full bg-white/80 p-5 shadow-sm ring-1 ring-white">
              <Icon size={38} className="text-forest-800" strokeWidth={1.7} />
            </div>
          </div>
        )}
        {(item.popular || item.spicy) && (
          <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white shadow-sm">
            {item.popular ? "Most ordered" : "Spicy"}
          </span>
        )}
        <div className="absolute bottom-2 right-2" onClick={(e) => e.stopPropagation()}>
          {qty === 0 ? (
            <button
              onClick={() => onAdd(item)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-emerald-500 active:scale-90"
              aria-label={`Add ${item.name}`}
            >
              <Plus size={24} />
            </button>
          ) : (
            <div className="pop-in flex items-center gap-1 rounded-full bg-white p-1 shadow-lg">
              <button onClick={() => onRemove(item.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-forest-700 transition-transform active:scale-90" aria-label="Decrease quantity">
                <Minus size={18} />
              </button>
              <span className="min-w-5 text-center text-base font-black text-forest-900">{qty}</span>
              <button onClick={() => onAdd(item)} className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white transition-transform active:scale-90" aria-label="Increase quantity">
                <Plus size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="px-1 pb-1 pt-3">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-forest-900">{item.name}</h3>
        <KhmerText className="line-clamp-1 text-base text-gray-600">{item.nameKh}</KhmerText>
        <p className="mt-0.5 text-base font-bold text-forest-900">${item.price.toFixed(2)}</p>
      </div>
    </article>
  );
}

// function CustomerPagination({ total, page, limit, onPageChange, onLimitChange }) {
//   const totalPages = Math.max(1, Math.ceil(total / limit));
//   const start = total === 0 ? 0 : (page - 1) * limit + 1;
//   const end = Math.min(page * limit, total);
//
//   const pages = () => {
//     if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
//     if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
//     if (page >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
//     return [1, "...", page - 1, page, page + 1, "...", totalPages];
//   };
//
//   if (total <= 0) return null;
//
//   return (
//     <div className="mt-6 flex flex-col gap-3 rounded-xl border border-cream-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
//       <div className="flex items-center justify-between gap-3 sm:justify-start">
//         <span className="text-xs text-gray-500">
//           Showing {start}-{end} of {total}
//         </span>
//         <select
//           value={limit}
//           onChange={(event) => {
//             onLimitChange(Number(event.target.value));
//             onPageChange(1);
//           }}
//           className="rounded-lg border border-cream-200 bg-white px-2 py-1 text-xs outline-none focus:border-forest-400"
//         >
//           {[8, 12, 20, 50].map((value) => (
//             <option key={value} value={value}>
//               {value} / page
//             </option>
//           ))}
//         </select>
//       </div>
//
//       <div className="flex items-center justify-center gap-1">
//         <button
//           onClick={() => onPageChange(page - 1)}
//           disabled={page === 1}
//           className="flex h-8 w-8 items-center justify-center rounded-lg border border-cream-200 bg-white text-xs text-gray-600 hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-40"
//           aria-label="Previous page"
//         >
//           <ChevronLeft size={14} />
//         </button>
//         {pages().map((item, index) =>
//           item === "..." ? (
//             <span key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center text-xs text-gray-400">
//               ...
//             </span>
//           ) : (
//             <button
//               key={item}
//               onClick={() => onPageChange(item)}
//               className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-colors ${
//                 page === item ? "border-forest-700 bg-forest-700 text-white" : "border-cream-200 bg-white text-gray-600 hover:bg-cream-100"
//               }`}
//             >
//               {item}
//             </button>
//           ),
//         )}
//         <button
//           onClick={() => onPageChange(page + 1)}
//           disabled={page === totalPages}
//           className="flex h-8 w-8 items-center justify-center rounded-lg border border-cream-200 bg-white text-xs text-gray-600 hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-40"
//           aria-label="Next page"
//         >
//           <ChevronLeft size={14} className="rotate-180" />
//         </button>
//       </div>
//     </div>
//   );
// }

export default function CustomerMenu() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState("");
  const { cart, dispatch, count, total } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tableId = params.get("tableId") || cart.tableId;
  const { status: scanStatus, result: scanResult } = useTableScan(tableId);
  const tableLabel = scanResult?.tableNumber || cart.tableNumber || tableId;
  const catRef = useRef(null);
  const searchTimer = useRef(null);

  const getQty = (id) => cart.items.find((i) => i.id === id)?.qty || 0;
  const handleAdd = (item) => dispatch({ type: "ADD", item });
  const handleRemove = (id) => dispatch({ type: "UPDATE_QTY", id, qty: getQty(id) - 1 });

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, DEBOUNCE_MS);

    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const res = await getCategories({
        offset: 0,
        max: 100,
        sort: "name",
        order: "asc",
        status: "true",
      });
      setCategories((res?.data?.data || []).map(normalizeCategory));
    } catch {
      setError("Could not load menu categories.");
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const loadItems = useCallback(async () => {
    try {
      setLoadingItems(true);
      setError("");
      const res = await getMenus({
        offset: (page - 1) * limit,
        max: limit,
        sort: "name",
        order: "asc",
        keyword: debouncedSearch || undefined,
        categoryId: activeCategory || undefined,
        status: "true",
      });
      setItems((res?.data?.data || []).map(normalizeItem));
      setTotalItems(res?.data?.total || 0);
    } catch {
      setError("Could not load menu items. Please ask staff for help.");
      setItems([]);
      setTotalItems(0);
    } finally {
      setLoadingItems(false);
    }
  }, [activeCategory, debouncedSearch, limit, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadItems();
  }, [loadItems]);

  const categoryTabs = [{ id: null, label: "All", icon: "Utensils" }, ...categories];
  const activeLabel = categoryTabs.find((category) => category.id === activeCategory)?.label || "Menu";
  const loading = loadingCategories || loadingItems;
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="sticky top-0 z-30 border-b border-cream-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-forest-800 transition-all hover:bg-cream-100 active:scale-90"
              aria-label="Go back"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes"
                className="input rounded-full py-3 pl-11 pr-10 text-base shadow-sm transition-shadow focus:shadow-md"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-forest-700" aria-label="Clear search">
                  <X size={17} />
                </button>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {tableId && (
                <span className="flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full border border-forest-200 bg-forest-50 px-3.5 text-sm font-bold text-forest-800 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Table {tableLabel}
                </span>
              )}
              <button
                onClick={() => navigate(`/orders${tableId ? `?tableId=${tableId}` : ""}`)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-700 transition-all hover:bg-forest-100 active:scale-90"
                aria-label="View order history"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M6 2h12a1 1 0 0 1 1 1v18.2a.5.5 0 0 1-.8.4L16 20l-2 1.6a.5.5 0 0 1-.6 0L12 20.5l-1.4 1.1a.5.5 0 0 1-.6 0L8 20l-2.2 1.6a.5.5 0 0 1-.8-.4V3a1 1 0 0 1 1-1Z"
                  />
                  <path stroke="white" strokeWidth="1.8" strokeLinecap="round" d="M8.5 7h7M8.5 11h7M8.5 15h4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div ref={catRef} className="scrollbar-none mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
          {categoryTabs.map((cat) => {
            const Icon = iconMap[cat.icon] || Utensils;
            const active = activeCategory === cat.id;

            return (
              <button
                key={cat.id ?? "__all"}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 sm:text-base ${
                  active ? "bg-forest-700 text-white shadow-md" : "border border-cream-200 bg-white text-gray-600 shadow-sm hover:-translate-y-0.5 hover:border-forest-300 hover:text-forest-700"
                }`}
              >
                <Icon size={18} />
                <span>
                  {cat.label}
                  {cat.labelKh && <span className="ml-1 text-sm opacity-80">{cat.labelKh}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-32 pt-5 sm:px-6">
        {scanStatus === "blocked" && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-rms/30 bg-amber-rms/10 px-4 py-3">
            <AlertTriangle size={17} className="shrink-0 text-amber-700" />
            <span className="text-sm text-amber-800">
              {scanResult?.message || "This table isn't available for ordering right now."}
            </span>
          </div>
        )}

        {scanStatus === "invalid" && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle size={17} className="shrink-0 text-red-500" />
            <span className="text-sm text-red-700">This QR code isn't valid. Please ask staff for help.</span>
          </div>
        )}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-forest-600">Digital menu</p>
            <h1 className="mt-1 text-2xl font-black text-forest-900 sm:text-3xl">{search ? "Search results" : activeLabel}</h1>
          </div>
          <p className="text-sm text-gray-500">{loadingItems ? "Loading items..." : `${totalItems} items available`}</p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-100 bg-white px-6 py-10 text-center">
            <Utensils size={34} className="mx-auto mb-3 text-red-300" />
            <p className="font-semibold text-forest-900">Menu unavailable</p>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button onClick={loadItems} className="btn-secondary mt-5">
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="menu-card animate-pulse">
                <div className="h-32 bg-cream-200" />
                <div className="space-y-3 p-3.5">
                  <div className="h-4 w-3/4 rounded bg-cream-200" />
                  <div className="h-3 w-full rounded bg-cream-200" />
                  <div className="h-3 w-2/3 rounded bg-cream-200" />
                  <div className="h-9 rounded-lg bg-cream-200" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-cream-200 bg-white px-6 py-14 text-center">
            <Search size={34} className="mx-auto mb-3 text-forest-300" />
            <p className="font-semibold text-forest-900">No items found</p>
            <p className="mt-1 text-sm text-gray-500">Try another search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} qty={getQty(item.id)} onAdd={handleAdd} onRemove={handleRemove} onOpen={setModal} />
            ))}
          </div>
        )}

        {/*{!error && !loading && items.length > 0 && (*/}
        {/*  <CustomerPagination total={totalItems} page={page} limit={limit} onPageChange={setPage} onLimitChange={setLimit} />*/}
        {/*)}*/}
      </main>

      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-cream-50 via-cream-50/95 to-transparent p-4 pt-8">
          <div className="mx-auto max-w-5xl">
            <button
              onClick={() => navigate(`/cart${tableId ? `?tableId=${tableId}` : ""}`)}
              className="flex w-full items-center justify-between rounded-xl bg-forest-900 px-5 py-4 text-white shadow-2xl shadow-forest-900/25 transition-all hover:bg-forest-800 active:scale-[0.99]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative shrink-0">
                  <ShoppingCart size={20} />
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-rms px-1 text-xs font-black text-forest-950">{count}</span>
                </div>
                <span className="truncate text-sm font-bold sm:text-base">View Order</span>
              </div>
              <span className="shrink-0 text-base font-black text-amber-rms">${total.toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}

      {modal && <ItemModal item={modal} qty={getQty(modal.id)} onAdd={handleAdd} onRemove={handleRemove} onClose={() => setModal(null)} />}
    </div>
  );
}
