import { useEffect, useRef, useState, useCallback } from "react";
import {
  Plus, Search, Edit2, Trash2, Eye,
  LayoutGrid, LayoutList, ChevronDown, X,
} from "lucide-react";

import Pagination      from "../../../components/shared/pagination";
import ItemFormDrawer  from "../../../components/common/items/ItemFormDrawer.jsx";
import ItemDetailModal from "../../../components/common/items/ItemDetailModal.jsx";
import ConfirmDialog   from "../../../components/ui/ConfirmDialog.jsx";
import { useToast }    from "../../../components/ui/Toast.jsx";

import { getMenus, createMenu, updateMenu, deleteMenu } from "../../../api/menu/item.api";
import { getCategories } from "../../../api/menu/category.api";

/* Constants  */
const DEBOUNCE_MS = 300;

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Available",  value: "true"  },
  { label: "Unavailable",value: "false" },
];

/* Helpers */
const statusStyle = (s) =>
    s ? "bg-forest-300/20 text-forest-700" : "bg-red-100 text-red-600";

/** How many advanced filters (status / price) are active */
const countActive = ({ statusFilter, minPrice, maxPrice }) =>
    [statusFilter, minPrice, maxPrice].filter(Boolean).length;

/* Sub-component — item thumbnail */
function ItemImage({ imageUrl, size = "sm" }) {
  const dim  = size === "sm" ? "w-8 h-8"   : "w-12 h-12";
  const text = size === "sm" ? "text-base"  : "text-2xl";

  return imageUrl ? (
      <img src={imageUrl} alt="item" className={`${dim} rounded-xl object-cover shrink-0`} />
  ) : (
      <div className={`${dim} rounded-xl bg-forest-900 flex items-center justify-center ${text} shrink-0`}>
        🍽️
      </div>
  );
}

/* Sub-component — skeleton rows (loading state) */
function SkeletonRows({ count = 8 }) {
  return Array.from({ length: count }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="table-td"><div className="w-8 h-8 rounded-xl bg-cream-200" /></td>
        <td className="table-td"><div className="h-3 bg-cream-200 rounded w-32" /></td>
        <td className="table-td hidden sm:table-cell"><div className="h-3 bg-cream-200 rounded w-20" /></td>
        <td className="table-td hidden md:table-cell"><div className="h-3 bg-cream-200 rounded w-48" /></td>
        <td className="table-td text-right"><div className="h-3 bg-cream-200 rounded w-12 ml-auto" /></td>
        <td className="table-td"><div className="h-5 bg-cream-200 rounded-full w-20" /></td>
        <td className="table-td"><div className="h-3 bg-cream-200 rounded w-16 ml-auto" /></td>
      </tr>
  ));
}

/* Subcomponent — category filter (pills / select) */
function CategoryFilter({ categories, active, onChange }) {
  return (
      <>
        {/* Desktop pills */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap pb-0.5">
          {[{ id: null, name: "All" }, ...categories].map((cat) => (
              <button
                  key={cat.id ?? "__all"}
                  onClick={() => onChange(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                      active === cat.id
                          ? "bg-forest-800 text-white shadow-sm"
                          : "bg-white border border-cream-200 text-gray-600 hover:border-forest-300 hover:text-forest-700"
                  }`}
              >
                {cat.name}
              </button>
          ))}
        </div>

        {/* Mobile select */}
        <div className="md:hidden relative w-full">
          <select
              value={active ?? ""}
              onChange={(e) => onChange(e.target.value || null)}
              className="w-full bg-white border border-cream-200 rounded-xl px-4 py-2.5 text-sm appearance-none focus:outline-none focus:border-forest-400 pr-10"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </>
  );
}

/*
   Subcomponent — inline advanced filter bar
   (Status + Price range — always visible on md+,
    stacked under search on mobile when expanded)
 */
function FilterBar({ statusFilter, minPrice, maxPrice, onChange, onClear, show }) {
  const active = countActive({ statusFilter, minPrice, maxPrice });
  if (!show) return null;

  return (
      <div className="flex flex-wrap items-end gap-2 p-3 rounded-xl bg-cream-50 border border-cream-200">

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</label>
          <div className="relative">
            <select
                value={statusFilter}
                onChange={(e) => onChange("statusFilter", e.target.value)}
                className="bg-white border border-cream-200 rounded-lg pl-3 pr-7 py-1.5 text-sm appearance-none focus:outline-none focus:border-forest-400 min-w-[130px]"
            >
              {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Min price */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Min $</label>
          <input
              type="number" min="0" step="0.01" placeholder="0.00"
              value={minPrice}
              onChange={(e) => onChange("minPrice", e.target.value)}
              className="bg-white border border-cream-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-forest-400 w-24"
          />
        </div>

        {/* Max price */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Max $</label>
          <input
              type="number" min="0" step="0.01" placeholder="Any"
              value={maxPrice}
              onChange={(e) => onChange("maxPrice", e.target.value)}
              className="bg-white border border-cream-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-forest-400 w-24"
          />
        </div>

        {/* Clear */}
        {active > 0 && (
            <button
                onClick={onClear}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 pb-1.5 whitespace-nowrap"
            >
              <X size={12} /> Clear ({active})
            </button>
        )}
      </div>
  );
}

function ItemCard({ item, onView, onEdit, onDelete }) {
  return (
      <div className="card p-4 flex gap-3">
        <ItemImage imageUrl={item.imageUrl} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-forest-900 text-sm truncate">{item.name}</p>
            <span className={`badge shrink-0 ${statusStyle(item.status)}`}>
            {item.status ? "Available" : "Unavailable"}
          </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{item.categoryName}</p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
          <p className="text-sm font-bold text-forest-800 mt-2">${Number(item.price || 0).toFixed(2)}</p>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button onClick={() => onView(item)}   className="p-1.5 rounded-lg hover:bg-cream-100"           title="View">  <Eye   size={13} /></button>
          <button onClick={() => onEdit(item)}   className="p-1.5 rounded-lg hover:bg-cream-100"           title="Edit">  <Edit2 size={13} /></button>
          <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={13} /></button>
        </div>
      </div>
  );
}

/* Main Component */

export default function MenuItems() {
  const toast = useToast();

  /* List */
  const [items,   setItems]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [view,    setView]    = useState("table");

  /* Pagination */
  const [page,  setPage]  = useState(1);
  const [limit, setLimit] = useState(10);

  /* Filters */
  const [searchInput,      setSearchInput]      = useState("");   // raw input value
  const [debouncedSearch,  setDebouncedSearch]  = useState("");   // sent to API
  const [categories,       setCategories]       = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [statusFilter,     setStatusFilter]     = useState("");   // "" | "true" | "false"
  const [minPrice,         setMinPrice]         = useState("");
  const [maxPrice,         setMaxPrice]         = useState("");
  const [showFilters,      setShowFilters]      = useState(false);

  /* Modals */
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const [selectedItem,  setSelectedItem]  = useState(null);
  const [detailItem,    setDetailItem]    = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* Debounce search input → debouncedSearch */
  const debounceTimer = useRef(null);

  const handleSearchInput = (value) => {
    setSearchInput(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, DEBOUNCE_MS);
  };

  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  /* Load items — all params forwarded to API */
  const loadMenus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMenus({
        offset:     (page - 1) * limit,
        max:        limit,
        sort:       "name",
        order:      "asc",
        keyword:    debouncedSearch   || undefined,
        categoryId: activeCategoryId  || undefined,
        status:     statusFilter      || undefined,
        minPrice:   minPrice          ? Number(minPrice) : undefined,
        maxPrice:   maxPrice          ? Number(maxPrice) : undefined,
      });
      setItems(res?.data?.data  || []);
      setTotal(res?.data?.total || 0);
    } catch {
      toast.error("Failed to load", "Could not load menu items.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch, activeCategoryId, statusFilter, minPrice, maxPrice]);

  useEffect(() => { loadMenus(); }, [loadMenus]);

  /* ── Load categories once ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await getCategories();
        setCategories(res?.data?.data || []);
      } catch {
        console.error("Load categories failed");
      }
    })();
  }, []);

  /* Filter helpers */
  const handleCategoryChange = (id) => { setActiveCategoryId(id); setPage(1); };

  const handleFilterChange = (field, value) => {
    setPage(1);
    if (field === "statusFilter") setStatusFilter(value);
    if (field === "minPrice")     setMinPrice(value);
    if (field === "maxPrice")     setMaxPrice(value);
  };

  const clearAdvancedFilters = () => {
    setStatusFilter(""); setMinPrice(""); setMaxPrice(""); setPage(1);
  };

  /* CRUD handlers */
  const handleAdd         = ()     => { setSelectedItem(null); setDrawerOpen(true); };
  const handleEdit        = (item) => { setSelectedItem(item); setDrawerOpen(true); };
  const handleCloseDrawer = ()     => { setDrawerOpen(false);  setSelectedItem(null); };
  const handleView        = (item) => setDetailItem(item);

  const handleSubmit = async (formData) => {
    try {
      if (selectedItem) {
        await updateMenu(selectedItem.id, formData);
        toast.success("Item updated", `"${formData.name}" was saved successfully.`);
      } else {
        await createMenu(formData);
        toast.success("Item added", `"${formData.name}" was added to the menu.`);
      }
      await loadMenus();
      handleCloseDrawer();
    } catch {
      toast.error("Save failed", "Please check your inputs and try again.");
    }
  };

  const handleDeleteRequest = (item) => setDeleteTarget({ id: item.id, name: item.name });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteMenu(deleteTarget.id);
      toast.success("Item deleted", `"${deleteTarget.name}" was removed.`);
      // Reload instead of mutating local state — keeps total count accurate
      await loadMenus();
    } catch {
      toast.error("Delete failed", "Could not delete the item. Please try again.");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  /* Derived */
  const advancedActiveCount = countActive({ statusFilter, minPrice, maxPrice });

  /* Render*/
  return (
      <>
        <div className="space-y-4 fade-in">

          {/* ── Toolbar ── */}
          <div className="flex flex-col gap-3">

            {/* Row 1 */}
            <div className="flex items-center gap-2">

              {/* Search */}
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={searchInput}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="Search items…"
                    className="w-full pl-8 pr-8 py-2 rounded-xl bg-white border border-cream-200 text-sm outline-none focus:border-forest-400"
                />
                {/* Clear search */}
                {searchInput && (
                    <button
                        onClick={() => handleSearchInput("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                    >
                      <X size={13} />
                    </button>
                )}
              </div>

              {/* Filter toggle */}
              <button
                  onClick={() => setShowFilters((v) => !v)}
                  title="Toggle filters"
                  className={`relative px-3 py-2 rounded-xl border text-sm font-medium shrink-0 transition-colors flex items-center gap-1.5 ${
                      showFilters || advancedActiveCount > 0
                          ? "bg-forest-800 border-forest-800 text-white"
                          : "bg-white border-cream-200 text-gray-600 hover:border-forest-300"
                  }`}
              >
                Filters
                {advancedActiveCount > 0 ? (
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-[10px] font-bold text-forest-900 flex items-center justify-center">
                  {advancedActiveCount}
                </span>
                ) : (
                    <ChevronDown size={13} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
                )}
              </button>

              {/* View toggle */}
              <button
                  onClick={() => setView((v) => (v === "table" ? "cards" : "table"))}
                  className="p-2 rounded-xl bg-white border border-cream-200 hover:border-forest-300 shrink-0"
                  title={view === "table" ? "Card view" : "Table view"}
              >
                {view === "table" ? <LayoutGrid size={15} /> : <LayoutList size={15} />}
              </button>

              {/* Add */}
              <button onClick={handleAdd} className="btn-primary flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                <Plus size={14} /> <span>Add Item</span>
              </button>
            </div>

            {/* Row 2 — category pills */}
            <CategoryFilter
                categories={categories}
                active={activeCategoryId}
                onChange={handleCategoryChange}
            />

            {/* Row 3 — advanced filter bar (collapsible) */}
            <FilterBar
                show={showFilters}
                statusFilter={statusFilter}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onChange={handleFilterChange}
                onClear={clearAdvancedFilters}
            />
          </div>

          {/* ── Card view ── */}
          {view === "cards" ? (
              <>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {Array.from({ length: limit }).map((_, i) => (
                          <div key={i} className="card p-4 flex gap-3 animate-pulse">
                            <div className="w-12 h-12 rounded-xl bg-cream-200 shrink-0" />
                            <div className="flex-1 space-y-2 py-1">
                              <div className="h-3 bg-cream-200 rounded w-3/4" />
                              <div className="h-2 bg-cream-200 rounded w-1/2" />
                              <div className="h-2 bg-cream-200 rounded w-full" />
                            </div>
                          </div>
                      ))}
                    </div>
                ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {items.map((item) => (
                            <ItemCard key={item.id} item={item} onView={handleView} onEdit={handleEdit} onDelete={handleDeleteRequest} />
                        ))}
                      </div>
                      {items.length === 0 && (
                          <div className="card text-center py-12 text-gray-400">No menu items found.</div>
                      )}
                    </>
                )}
                <Pagination total={total} page={page} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
              </>

          ) : (
              /* ── Table view ── */
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="border-b border-cream-200">
                    <tr>
                      <th className="table-th w-10" />
                      <th className="table-th">Name</th>
                      <th className="table-th hidden sm:table-cell">Category</th>
                      <th className="table-th hidden md:table-cell">Description</th>
                      <th className="table-th text-right">Price</th>
                      <th className="table-th">Status</th>
                      <th className="table-th text-right">Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {loading ? (
                        <SkeletonRows count={limit} />
                    ) : (
                        items.map((item) => (
                            <tr key={item.id} className="hover:bg-cream-50">
                              <td className="table-td"><ItemImage imageUrl={item.imageUrl} size="sm" /></td>

                              <td className="table-td font-medium">
                                <span className="text-sm text-forest-900">{item.name}</span>
                                <span className="sm:hidden block text-xs text-gray-400 mt-0.5">{item.categoryName}</span>
                                <span className="md:hidden block text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{item.description}</span>
                              </td>

                              <td className="table-td hidden sm:table-cell text-sm text-gray-600">{item.categoryName}</td>
                              <td className="table-td hidden md:table-cell text-sm text-gray-500 max-w-[200px] truncate">{item.description}</td>

                              <td className="table-td text-right font-semibold whitespace-nowrap">
                                ${Number(item.price || 0).toFixed(2)}
                              </td>

                              <td className="table-td">
                          <span className={`badge whitespace-nowrap ${statusStyle(item.status)}`}>
                            {item.status ? "Available" : "Unavailable"}
                          </span>
                              </td>

                              <td className="table-td">
                                <div className="flex justify-end gap-1.5">
                                  <button onClick={() => handleView(item)}          className="p-1.5 rounded-lg hover:bg-cream-100"           title="View">  <Eye   size={13} /></button>
                                  <button onClick={() => handleEdit(item)}          className="p-1.5 rounded-lg hover:bg-cream-100"           title="Edit">  <Edit2 size={13} /></button>
                                  <button onClick={() => handleDeleteRequest(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={13} /></button>
                                </div>
                              </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                  </table>
                </div>

                {!loading && items.length === 0 && (
                    <div className="text-center py-12 text-gray-400">No menu items found.</div>
                )}

                <div className="border-t border-cream-200 px-4">
                  <Pagination
                      total={total} page={page} limit={limit}
                      onPageChange={setPage}
                      onLimitChange={(l) => { setLimit(l); setPage(1); }}
                  />
                </div>
              </div>
          )}
        </div>

        {/* ── Create / Edit Drawer ── */}
        <ItemFormDrawer
            open={drawerOpen}
            onClose={handleCloseDrawer}
            onSubmit={handleSubmit}
            item={selectedItem}
            categories={categories}
        />

        {/* ── View Detail Modal ── */}
        <ItemDetailModal
            open={!!detailItem}
            onClose={() => setDetailItem(null)}
            item={detailItem}
            onEdit={(item) => { setDetailItem(null); handleEdit(item); }}
        />

        {/* ── Delete Confirm Dialog ── */}
        <ConfirmDialog
            open={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDeleteConfirm}
            loading={deleteLoading}
            variant="danger"
            title="Delete item?"
            description={`"${deleteTarget?.name}" will be permanently removed from the menu. This cannot be undone.`}
            confirmLabel="Yes, delete"
            cancelLabel="Keep it"
        />
      </>
  );
}
