import { useEffect, useRef, useState, useCallback } from "react";
import {
  Plus, Search, Edit2, Trash2, Eye,
  LayoutGrid, LayoutList, ChevronDown, X,
} from "lucide-react";

import Pagination          from "../../../components/shared/pagination";
import CategoryFormModal   from "../../../components/common/category/modals/CategoryFormModal.jsx";
import CategoryDetailModal from "../../../components/common/category/modals/CategoryDetailModal.jsx";
import ConfirmDialog       from "../../../components/ui/ConfirmDialog.jsx";
import { useToast }        from "../../../components/ui/Toast.jsx";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,

} from "../../../api/menu/category.api";

/* Constants  */
const DEBOUNCE_MS = 300;

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Active",     value: "true"  },
  { label: "Inactive",   value: "false" },
];

/* Helpers */
const statusStyle = (status) =>
    status ? "bg-forest-300/20 text-forest-700" : "bg-red-100 text-red-600";

/** How many advanced filters (status) are active */
const countActive = ({ statusFilter }) => [statusFilter].filter(Boolean).length;

/* Subcomponent — avatar (first letter of name, since there's no color/image field) */
function CategoryAvatar({ name, size = "sm" }) {
  const dim  = size === "sm" ? "w-8 h-8 text-sm" : "w-12 h-12 text-lg";
  return (
      <div className={`${dim} rounded-full bg-forest-900 text-white flex items-center justify-center font-semibold shrink-0`}>
        {name?.charAt(0)?.toUpperCase() ?? "?"}
      </div>
  );
}

/* Subcomponent — skeleton rows (loading state) */
function SkeletonRows({ count = 8 }) {
  return Array.from({ length: count }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="table-td"><div className="w-8 h-8 rounded-full bg-cream-200" /></td>
        <td className="table-td"><div className="h-3 bg-cream-200 rounded w-32" /></td>
        <td className="table-td hidden sm:table-cell"><div className="h-3 bg-cream-200 rounded w-16" /></td>
        <td className="table-td hidden md:table-cell"><div className="h-3 bg-cream-200 rounded w-48" /></td>
        <td className="table-td"><div className="h-5 bg-cream-200 rounded-full w-20" /></td>
        <td className="table-td"><div className="h-3 bg-cream-200 rounded w-16 ml-auto" /></td>
      </tr>
  ));
}

/*
   Subcomponent — inline advanced filter bar
   (Status only — always visible on md+,
    stacked under search on mobile when expanded)
 */
function FilterBar({ statusFilter, onChange, onClear, show }) {
  const active = countActive({ statusFilter });
  if (!show) return null;

  return (
      <div className="flex flex-wrap items-end gap-2 p-3 rounded-xl bg-cream-50 border border-cream-200">
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

/* Subcomponent — category card (grid view) */
function CategoryCard({ category, onView, onEdit, onDelete }) {
  return (
      <div className="card p-4 flex gap-3">
        <CategoryAvatar name={category.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-forest-900 text-sm truncate">{category.name}</p>
              {category.nameKh && (
                  <p className="text-xs text-gray-400 truncate">{category.nameKh}</p>
              )}
            </div>
            <span className={`badge shrink-0 ${statusStyle(category.status)}`}>
            {category.status ? "Active" : "Inactive"}
          </span>
          </div>
          <p className="text-[11px] text-gray-400 font-mono mt-1">{category.code}</p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{category.description}</p>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button onClick={() => onView(category)}   className="p-1.5 rounded-lg hover:bg-cream-100"           title="View">  <Eye   size={13} /></button>
          <button onClick={() => onEdit(category)}   className="p-1.5 rounded-lg hover:bg-cream-100"           title="Edit">  <Edit2 size={13} /></button>
          <button onClick={() => onDelete(category)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={13} /></button>
        </div>
      </div>
  );
}

/* Main Component */

export default function Categories() {
  const toast = useToast();

  /* List */
  const [categories, setCategories] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState("table");

  /* Pagination */
  const [page,  setPage]  = useState(1);
  const [limit, setLimit] = useState(10);

  /* Filters */
  const [searchInput,     setSearchInput]     = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter,    setStatusFilter]    = useState("");   // "" | "true" | "false"
  const [showFilters,     setShowFilters]     = useState(false);

  /* Modals */
  const [formOpen,      setFormOpen]      = useState(false);
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

  /* Load categories — all params forwarded to API */
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCategories({
        offset:  (page - 1) * limit,
        max:     limit,
        sort:    "name",
        order:   "asc",
        keyword: debouncedSearch || undefined,
        status:  statusFilter    || undefined,
      });
      setCategories(res?.data?.data  || []);
      setTotal(res?.data?.total || 0);
    } catch {
      toast.error("Failed to load", "Could not load categories.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch, statusFilter]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  /* Filter helpers */
  const handleFilterChange = (field, value) => {
    setPage(1);
    if (field === "statusFilter") setStatusFilter(value);
  };

  const clearAdvancedFilters = () => {
    setStatusFilter(""); setPage(1);
  };

  /* CRUD handlers */
  const handleAdd       = ()       => { setSelectedItem(null); setFormOpen(true); };
  const handleEdit      = (cat)    => { setSelectedItem(cat);   setFormOpen(true); };
  const handleCloseForm = ()       => { setFormOpen(false);     setSelectedItem(null); };
  const handleView      = (cat)    => setDetailItem(cat);

  const handleSubmit = async (formData) => {
    try {
      if (selectedItem) {
        await updateCategory(selectedItem.id, formData);
        toast.success("Category updated", `"${formData.name}" was saved successfully.`);
      } else {
        await createCategory(formData);
        toast.success("Category added", `"${formData.name}" was added successfully.`);
      }
      await loadCategories();
      handleCloseForm();
    } catch {
      toast.error("Save failed", "Please check your inputs and try again.");
    }
  };

  const handleDeleteRequest = (cat) => setDeleteTarget({ id: cat.id, name: cat.name });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success("Category deleted", `"${deleteTarget.name}" was removed.`);
      await loadCategories();
    } catch {
      toast.error("Delete failed", "Could not delete the category. Please try again.");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  /* Derived */
  const advancedActiveCount = countActive({ statusFilter });

  /* Render*/
  return (
      <>
        <div className="space-y-4 fade-in">

          {/* ── Toolbar ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={searchInput}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="Search categories…"
                    className="w-full pl-8 pr-8 py-2 rounded-xl bg-white border border-cream-200 text-sm outline-none focus:border-forest-400"
                />
                {searchInput && (
                    <button
                        onClick={() => handleSearchInput("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                    >
                      <X size={13} />
                    </button>
                )}
              </div>

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

              <button
                  onClick={() => setView((v) => (v === "table" ? "cards" : "table"))}
                  className="p-2 rounded-xl bg-white border border-cream-200 hover:border-forest-300 shrink-0"
                  title={view === "table" ? "Card view" : "Table view"}
              >
                {view === "table" ? <LayoutGrid size={15} /> : <LayoutList size={15} />}
              </button>

              <button onClick={handleAdd} className="btn-primary flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                <Plus size={14} /> <span>Add Category</span>
              </button>
            </div>

            <FilterBar
                show={showFilters}
                statusFilter={statusFilter}
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
                            <div className="w-12 h-12 rounded-full bg-cream-200 shrink-0" />
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
                        {categories.map((cat) => (
                            <CategoryCard key={cat.id} category={cat} onView={handleView} onEdit={handleEdit} onDelete={handleDeleteRequest} />
                        ))}
                      </div>
                      {categories.length === 0 && (
                          <div className="card text-center py-12 text-gray-400">No categories found.</div>
                      )}
                    </>
                )}
                <Pagination total={total} page={page} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
              </>

          ) : (
              /* ── Table view ── */
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px]">
                    <thead className="border-b border-cream-200">
                    <tr>
                      <th className="table-th w-10" />
                      <th className="table-th">Name</th>
                      <th className="table-th hidden sm:table-cell">Code</th>
                      <th className="table-th hidden md:table-cell">Description</th>
                      <th className="table-th">Status</th>
                      <th className="table-th text-right">Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {loading ? (
                        <SkeletonRows count={limit} />
                    ) : (
                        categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-cream-50">
                              <td className="table-td"><CategoryAvatar name={cat.name} size="sm" /></td>

                              <td className="table-td font-medium">
                                <span className="text-sm text-forest-900">{cat.name}</span>
                                {cat.nameKh && (
                                    <span className="block text-xs text-gray-400 mt-0.5">{cat.nameKh}</span>
                                )}
                                <span className="sm:hidden block text-xs text-gray-400 font-mono mt-0.5">{cat.code}</span>
                                <span className="md:hidden block text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{cat.description}</span>
                              </td>

                              <td className="table-td hidden sm:table-cell text-xs font-mono text-gray-500">{cat.code}</td>
                              <td className="table-td hidden md:table-cell text-sm text-gray-500 max-w-[240px] truncate">{cat.description}</td>

                              <td className="table-td">
                          <span className={`badge whitespace-nowrap ${statusStyle(cat.status)}`}>
                            {cat.status ? "Active" : "Inactive"}
                          </span>
                              </td>

                              <td className="table-td">
                                <div className="flex justify-end gap-1.5">
                                  <button onClick={() => handleView(cat)}          className="p-1.5 rounded-lg hover:bg-cream-100"           title="View">  <Eye   size={13} /></button>
                                  <button onClick={() => handleEdit(cat)}          className="p-1.5 rounded-lg hover:bg-cream-100"           title="Edit">  <Edit2 size={13} /></button>
                                  <button onClick={() => handleDeleteRequest(cat)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={13} /></button>
                                </div>
                              </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                  </table>
                </div>

                {!loading && categories.length === 0 && (
                    <div className="text-center py-12 text-gray-400">No categories found.</div>
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

        {/* ── Create / Edit Modal ── */}
        <CategoryFormModal
            open={formOpen}
            onClose={handleCloseForm}
            onSubmit={handleSubmit}
            initial={selectedItem}
            mode={selectedItem ? "edit" : "create"}
        />

        {/* ── View Detail Modal ── */}
        <CategoryDetailModal
            open={!!detailItem}
            onClose={() => setDetailItem(null)}
            category={detailItem}
            onEdit={(cat) => { setDetailItem(null); handleEdit(cat); }}
        />

        {/* ── Delete Confirm Dialog ── */}
        <ConfirmDialog
            open={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDeleteConfirm}
            loading={deleteLoading}
            variant="danger"
            title="Delete category?"
            description={`"${deleteTarget?.name}" will be permanently removed. This cannot be undone.`}
            confirmLabel="Yes, delete"
            cancelLabel="Keep it"
        />
      </>
  );
}