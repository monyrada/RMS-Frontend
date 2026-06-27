import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, Eye, LayoutGrid, LayoutList, ChevronDown } from "lucide-react";

import Pagination      from "../../../components/shared/pagination";
import ItemFormDrawer  from "../../../components/common/items/ItemFormDrawer.jsx";
import ItemDetailModal from "../../../components/common/items/ItemDetailModal.jsx";
import ConfirmDialog   from "../../../components/ui/ConfirmDialog.jsx";
import { useToast }    from "../../../components/ui/Toast.jsx";

// Integration API
import { getMenus, createMenu, updateMenu, deleteMenu } from "../../../api/menu/item.api";
import { getCategories } from "../../../api/menu/category.api";

/* ── Helpers ── */
const statusStyle = (status) =>
    status ? "bg-forest-300/20 text-forest-700" : "bg-red-100 text-red-600";

/* ── Sub-components ── */
function ItemImage({ imageUrl, size = "sm" }) {
  const dim  = size === "sm" ? "w-8 h-8" : "w-12 h-12";
  const text = size === "sm" ? "text-base" : "text-2xl";

  if (imageUrl) {
    return (
        <img
            src={imageUrl}
            alt="menu item"
            className={`${dim} rounded-xl object-cover shrink-0`}
        />
    );
  }
  return (
      <div className={`${dim} rounded-xl bg-forest-900 flex items-center justify-center ${text} shrink-0`}>
        🍽️
      </div>
  );
}

/*
   Category Filter
*/
function CategoryFilter({ categories, active, onChange }) {
  return (
      <>
        {/* Desktop: scrollable pill row */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-nowrap pb-0.5">
          <button
              onClick={() => onChange(null)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  active === null
                      ? "bg-forest-800 text-white shadow-sm"
                      : "bg-white border border-cream-200 text-gray-600 hover:border-forest-300 hover:text-forest-700"
              }`}
          >
            All
          </button>
          {categories.map((cat) => (
              <button
                  key={cat.id}
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

        {/* Mobile: native select */}
        <div className="md:hidden relative w-full">
          <select
              value={active || ""}
              onChange={(e) => onChange(e.target.value || null)}
              className="w-full bg-white border border-cream-200 rounded-xl px-4 py-2.5 text-sm appearance-none focus:outline-none focus:border-forest-400 pr-10"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </>
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
          <p className="text-sm font-bold text-forest-800 mt-2">
            ${Number(item.price || 0).toFixed(2)}
          </p>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          <button onClick={() => onView(item)} className="p-1.5 rounded-lg hover:bg-cream-100" title="View"><Eye size={13} /></button>
          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-cream-100" title="Edit"><Edit2 size={13} /></button>
          <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={13} /></button>
        </div>
      </div>
  );
}

/* ── Main Component ── */

export default function MenuItems() {
  const toast = useToast();

  const [items,            setItems]           = useState([]);
  const [total,            setTotal]           = useState(0);
  const [loading,          setLoading]         = useState(true);
  const [search,           setSearch]          = useState("");
  const [view,             setView]            = useState("table");
  const [page,             setPage]            = useState(1);
  const [limit,            setLimit]           = useState(10);
  const [categories,       setCategories]      = useState([]);
  const [activeCategoryId, setActiveCategoryId]= useState(null);
  const [drawerOpen,       setDrawerOpen]      = useState(false);
  const [selectedItem,     setSelectedItem]    = useState(null);
  const [detailItem,       setDetailItem]      = useState(null);
  const [deleteTarget,     setDeleteTarget]    = useState(null);
  const [deleteLoading,    setDeleteLoading]   = useState(false);

  /* Load data */
  const loadMenus = async (currentPage = page, currentLimit = limit) => {
    try {
      setLoading(true);
      const res = await getMenus({
        offset: (currentPage - 1) * currentLimit,
        max:    currentLimit,
        sort:   "name",
        order:  "asc",
      });
      setItems(res?.data?.data  || []);
      setTotal(res?.data?.total || 0);
    } catch {
      toast.error("Failed to load", "Could not load menu items.");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res?.data?.data || []);
    } catch {
      console.error("Load categories failed");
    }
  };

  useEffect(() => { loadMenus(page, limit); }, [page, limit]);
  useEffect(() => { loadCategories(); },      []);

  /* Handlers */
  const handleAdd         = ()       => { setSelectedItem(null); setDrawerOpen(true); };
  const handleEdit        = (item)   => { setSelectedItem(item); setDrawerOpen(true); };
  const handleCloseDrawer = ()       => { setDrawerOpen(false);  setSelectedItem(null); };
  const handleView        = (item)   => setDetailItem(item);

  const handleSubmit = async (formData) => {
    try {
      if (selectedItem) {
        await updateMenu(selectedItem.id, formData);
        toast.success("Item updated", `"${formData.name}" was saved successfully.`);
      } else {
        await createMenu(formData);
        toast.success("Item added", `"${formData.name}" was added to the menu.`);
      }
      await loadMenus(page, limit);
      handleCloseDrawer();
    } catch {
      toast.error("Save failed", "Please check your inputs and try again.");
    }
  };

  const handleDeleteRequest = (item) =>
      setDeleteTarget({ id: item.id, name: item.name });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteMenu(deleteTarget.id);
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setTotal((prev) => prev - 1);
      toast.success("Item deleted", `"${deleteTarget.name}" was removed.`);
    } catch {
      toast.error("Delete failed", "Could not delete the item. Please try again.");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  /* Filter */
  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();
    return items.filter((item) => {
      const matchSearch   = item.name?.toLowerCase().includes(keyword)
          || item.nameKh?.toLowerCase().includes(keyword);
      const matchCategory = activeCategoryId === null
          || item.categoryId === activeCategoryId;
      return matchSearch && matchCategory;
    });
  }, [items, search, activeCategoryId]);

  if (loading) {
    return <div className="card p-8 text-center text-gray-400">Loading menu items…</div>;
  }

  return (
      <>
        <div className="space-y-4 fade-in">

          {/* ── Top bar ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search items…"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-cream-200 text-sm outline-none focus:border-forest-400"
                />
              </div>

              {/* View toggle */}
              <button
                  onClick={() => setView((v) => v === "table" ? "cards" : "table")}
                  className="p-2 rounded-xl bg-white border border-cream-200 hover:border-forest-300 shrink-0"
                  title={view === "table" ? "Switch to card view" : "Switch to table view"}
              >
                {view === "table" ? <LayoutGrid size={15} /> : <LayoutList size={15} />}
              </button>

              {/* Add */}
              <button onClick={handleAdd} className="btn-primary flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                <Plus size={14} />
                <span>Add Item</span>
              </button>
            </div>

            {/* Row 2: category filter (full width on mobile via select, pills on md+) */}
            <CategoryFilter
                categories={categories}
                active={activeCategoryId}
                onChange={(id) => { setActiveCategoryId(id); setPage(1); }}
            />
          </div>

          {/* ── Card view ── */}
          {view === "cards" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filtered.map((item) => (
                      <ItemCard
                          key={item.id}
                          item={item}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDeleteRequest}
                      />
                  ))}
                </div>

                {filtered.length === 0 && (
                    <div className="card text-center py-12 text-gray-400">No menu items found.</div>
                )}

                <Pagination
                    total={total}
                    page={page}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                />
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
                    {filtered.map((item) => (
                        <tr key={item.id} className="hover:bg-cream-50">
                          <td className="table-td">
                            <ItemImage imageUrl={item.imageUrl} size="sm" />
                          </td>

                          <td className="table-td font-medium">
                            <span className="text-sm text-forest-900">{item.name}</span>

                            {/* Mobile: category under name */}
                            <span className="sm:hidden block text-xs text-gray-400 mt-0.5">
                              {item.categoryName}
                            </span>

                            {/* Mobile + tablet: description under name */}
                            <span className="md:hidden block text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">
                              {item.description}
                            </span>
                          </td>

                          <td className="table-td hidden sm:table-cell text-sm text-gray-600">
                            {item.categoryName}
                          </td>

                          <td className="table-td hidden md:table-cell text-sm text-gray-500 max-w-[200px] truncate">
                            {item.description}
                          </td>

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
                              <button onClick={() => handleView(item)} className="p-1.5 rounded-lg hover:bg-cream-100" title="View"><Eye size={13} /></button>
                              <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-cream-100" title="Edit"><Edit2 size={13} /></button>
                              <button onClick={() => handleDeleteRequest(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-gray-400">No menu items found.</div>
                )}

                {/* ── Pagination ── */}
                <div className="border-t border-cream-200 px-4">
                  <Pagination
                      total={total}
                      page={page}
                      limit={limit}
                      onPageChange={setPage}
                      onLimitChange={setLimit}
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
            onEdit={(item) => {
              setDetailItem(null);
              handleEdit(item);
            }}
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
