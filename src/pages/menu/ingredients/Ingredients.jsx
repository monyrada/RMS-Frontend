// Ingredients.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import {
    Plus, Search, Edit2, Trash2, Eye,
    LayoutGrid, LayoutList, ChevronDown, X, Package,
} from "lucide-react";

import Pagination           from "../../../components/shared/pagination";
import IngredientFormDrawer from "../../../components/common/ingredient/IngredientFormDrawer.jsx";
import IngredientDetailModal from "../../../components/common/ingredient/IngredientDetailModal.jsx";
import ConfirmDialog         from "../../../components/ui/ConfirmDialog.jsx";
import { useToast }          from "../../../components/ui/Toast.jsx";

import {
    getIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient,
} from "../../../api/menu/ingredient.api.js";

/* Constants */
const DEBOUNCE_MS = 300;

const STATUS_OPTIONS = [
    { label: "All Status",     value: ""             },
    { label: "In Stock",       value: "IN_STOCK"     },
    { label: "Low Stock",      value: "LOW_STOCK"    },
    { label: "Out of Stock",   value: "OUT_OF_STOCK" },
];

const STATUS_STYLES = {
    IN_STOCK:     { label: "In Stock",     badge: "bg-forest-300/20 text-forest-700" },
    LOW_STOCK:    { label: "Low Stock",    badge: "bg-amber-100 text-amber-700"      },
    OUT_OF_STOCK: { label: "Out of Stock", badge: "bg-red-100 text-red-600"          },
};

const statusStyle = (s) => STATUS_STYLES[s]?.badge ?? "bg-gray-100 text-gray-600";
const statusLabel = (s) => STATUS_STYLES[s]?.label ?? s;

/** Unwraps the { statusCode, data, ... } envelope consistently */
const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

/** How many advanced filters are active */
const countActive = ({ statusFilter }) => [statusFilter].filter(Boolean).length;

/* Subcomponent — ingredient icon (no imageUrl on this entity) */
function IngredientIcon({ size = "sm" }) {
    const dim = size === "sm" ? "w-8 h-8" : "w-12 h-12";
    const iconSize = size === "sm" ? 14 : 20;
    return (
        <div className={`${dim} rounded-xl bg-forest-900 flex items-center justify-center shrink-0`}>
            <Package size={iconSize} className="text-cream-100" />
        </div>
    );
}

/* Subcomponent — skeleton rows (loading state) */
function SkeletonRows({ count = 8 }) {
    return Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="animate-pulse">
            <td className="table-td"><div className="w-8 h-8 rounded-xl bg-cream-200" /></td>
            <td className="table-td"><div className="h-3 bg-cream-200 rounded w-32" /></td>
            <td className="table-td hidden md:table-cell"><div className="h-3 bg-cream-200 rounded w-48" /></td>
            <td className="table-td hidden sm:table-cell"><div className="h-3 bg-cream-200 rounded w-12" /></td>
            <td className="table-td"><div className="h-5 bg-cream-200 rounded-full w-20" /></td>
            <td className="table-td"><div className="h-3 bg-cream-200 rounded w-16 ml-auto" /></td>
        </tr>
    ));
}

/* Subcomponent — inline advanced filter bar (status only) */
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
                        className="bg-white border border-cream-200 rounded-lg pl-3 pr-7 py-1.5 text-sm appearance-none focus:outline-none focus:border-forest-400 min-w-[150px]"
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

function IngredientCard({ ingredient, onView, onEdit, onDelete }) {
    return (
        <div className="card p-4 flex gap-3">
            <IngredientIcon size="lg" />
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-forest-900 text-sm truncate">
                        {ingredient.name}
                        {ingredient.nameKh && (
                            <span className="text-gray-400 font-normal ml-1">({ingredient.nameKh})</span>
                        )}
                    </p>
                    <span className={`badge shrink-0 ${statusStyle(ingredient.stockStatus)}`}>
            {statusLabel(ingredient.stockStatus)}
          </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ingredient.description}</p>
                <p className="text-xs text-gray-400 mt-2">Unit: {ingredient.unit}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => onView(ingredient)}   className="p-1.5 rounded-lg hover:bg-cream-100"           title="View">  <Eye   size={13} /></button>
                <button onClick={() => onEdit(ingredient)}   className="p-1.5 rounded-lg hover:bg-cream-100"           title="Edit">  <Edit2 size={13} /></button>
                <button onClick={() => onDelete(ingredient)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={13} /></button>
            </div>
        </div>
    );
}

/* Main Component */

export default function Ingredients() {
    const toast = useToast();

    /* List */
    const [ingredients, setIngredients] = useState([]);
    const [total,   setTotal]   = useState(0);
    const [loading, setLoading] = useState(true);
    const [view,    setView]    = useState("table");

    /* Pagination */
    const [page,  setPage]  = useState(1);
    const [limit, setLimit] = useState(10);

    /* Filters */
    const [searchInput,     setSearchInput]     = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter,    setStatusFilter]    = useState("");
    const [showFilters,     setShowFilters]     = useState(false);

    /* Modals */
    const [drawerOpen,       setDrawerOpen]       = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [detailIngredient, setDetailIngredient] = useState(null);
    const [deleteTarget,     setDeleteTarget]     = useState(null);
    const [deleteLoading,    setDeleteLoading]    = useState(false);

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

    /* Load ingredients — all params forwarded to API */
    const loadIngredients = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getIngredients({
                offset:       (page - 1) * limit,
                max:          limit,
                sort:         "name",
                order:        "asc",
                keyword:      debouncedSearch || undefined,
                stockStatus:  statusFilter    || undefined,
            });
            setIngredients(res?.data?.data  || []);
            setTotal(res?.data?.total || 0);
        } catch {
            toast.error("Failed to load", "Could not load ingredients.");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, debouncedSearch, statusFilter]);

    useEffect(() => { loadIngredients(); }, [loadIngredients]);

    /* Filter helpers */
    const handleFilterChange = (field, value) => {
        setPage(1);
        if (field === "statusFilter") setStatusFilter(value);
    };

    const clearAdvancedFilters = () => {
        setStatusFilter(""); setPage(1);
    };

    /* CRUD handlers */
    const handleAdd = () => { setSelectedIngredient(null); setDrawerOpen(true); };

    /**
     * Edit: show the list-row data immediately (no blank flash), then
     * fetch the full record via getIngredientById — the list endpoint
     * only returns id/name/nameKh/description/stockStatus/unit, but the
     * form needs stockQuantity/minStockLevel/costPerUnit/isActive/notes.
     */
    const handleEdit = async (ing) => {
        setSelectedIngredient(ing);
        setDrawerOpen(true);
        try {
            const res = await getIngredientById(ing.id);
            const full = unwrap(res);
            if (full) setSelectedIngredient(full);
        } catch {
            toast.error("Failed to load", "Could not load full ingredient details.");
        }
    };

    const handleCloseDrawer = () => { setDrawerOpen(false); setSelectedIngredient(null); };

    /**
     * View: same reasoning as handleEdit — the list row alone can't
     * populate the detail modal's stock/cost/notes section.
     */
    const handleView = async (ing) => {
        setDetailIngredient(ing);
        try {
            const res = await getIngredientById(ing.id);
            const full = unwrap(res);
            if (full) setDetailIngredient(full);
        } catch {
            toast.error("Failed to load", "Could not load full ingredient details.");
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (selectedIngredient) {
                await updateIngredient(selectedIngredient.id, formData);
                toast.success("Ingredient updated", `"${formData.name}" was saved successfully.`);
            } else {
                await createIngredient(formData);
                toast.success("Ingredient added", `"${formData.name}" was added.`);
            }
            await loadIngredients();
            handleCloseDrawer();
        } catch {
            toast.error("Save failed", "Please check your inputs and try again.");
        }
    };

    const handleDeleteRequest = (ing) => setDeleteTarget({ id: ing.id, name: ing.name });

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await deleteIngredient(deleteTarget.id);
            toast.success("Ingredient deleted", `"${deleteTarget.name}" was removed.`);
            await loadIngredients();
        } catch {
            toast.error("Delete failed", "Could not delete the ingredient. Please try again.");
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    };

    /* Derived */
    const advancedActiveCount = countActive({ statusFilter });
    const lowOrOutCount = ingredients.filter(
        (i) => i.stockStatus === "LOW_STOCK" || i.stockStatus === "OUT_OF_STOCK"
    ).length;

    /* Render */
    return (
        <>
            <div className="space-y-4 fade-in">

                {/* Toolbar */}
                <div className="flex flex-col gap-3">

                    {/* Row 1 */}
                    <div className="flex items-center gap-2">

                        {/* Search */}
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={searchInput}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                placeholder="Search ingredients…"
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
                            <Plus size={14} /> <span>Add Ingredient</span>
                        </button>
                    </div>

                    {/* Row 2 — advanced filter bar (collapsible) */}
                    <FilterBar
                        show={showFilters}
                        statusFilter={statusFilter}
                        onChange={handleFilterChange}
                        onClear={clearAdvancedFilters}
                    />
                </div>

                {/* Attention banner */}
                {!loading && lowOrOutCount > 0 && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5">
                        {lowOrOutCount} ingredient{lowOrOutCount > 1 ? "s" : ""} on this page need attention.
                    </div>
                )}

                {/* Card view */}
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
                                    {ingredients.map((ing) => (
                                        <IngredientCard
                                            key={ing.id}
                                            ingredient={ing}
                                            onView={handleView}
                                            onEdit={handleEdit}
                                            onDelete={handleDeleteRequest}
                                        />
                                    ))}
                                </div>
                                {ingredients.length === 0 && (
                                    <div className="card text-center py-12 text-gray-400">No ingredients found.</div>
                                )}
                            </>
                        )}
                        <Pagination
                            total={total} page={page} limit={limit}
                            onPageChange={setPage}
                            onLimitChange={(l) => { setLimit(l); setPage(1); }}
                        />
                    </>
                ) : (
                    /* Table view */
                    <div className="card p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[560px]">
                                <thead className="border-b border-cream-200">
                                <tr>
                                    <th className="table-th w-10" />
                                    <th className="table-th">Name</th>
                                    <th className="table-th hidden md:table-cell">Description</th>
                                    <th className="table-th hidden sm:table-cell">Unit</th>
                                    <th className="table-th">Status</th>
                                    <th className="table-th text-right">Actions</th>
                                </tr>
                                </thead>

                                <tbody>
                                {loading ? (
                                    <SkeletonRows count={limit} />
                                ) : (
                                    ingredients.map((ing) => (
                                        <tr key={ing.id} className="hover:bg-cream-50">
                                            <td className="table-td"><IngredientIcon size="sm" /></td>

                                            <td className="table-td font-medium">
                          <span className="text-sm text-forest-900">
                            {ing.name}
                              {ing.nameKh && (
                                  <span className="text-gray-400 font-normal ml-1">({ing.nameKh})</span>
                              )}
                          </span>
                                                <span className="md:hidden block text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">
                            {ing.description}
                          </span>
                                            </td>

                                            <td className="table-td hidden md:table-cell text-sm text-gray-500 max-w-[240px] truncate">
                                                {ing.description}
                                            </td>
                                            <td className="table-td hidden sm:table-cell text-sm text-gray-600">{ing.unit}</td>

                                            <td className="table-td">
                          <span className={`badge whitespace-nowrap ${statusStyle(ing.stockStatus)}`}>
                            {statusLabel(ing.stockStatus)}
                          </span>
                                            </td>

                                            <td className="table-td">
                                                <div className="flex justify-end gap-1.5">
                                                    <button onClick={() => handleView(ing)}          className="p-1.5 rounded-lg hover:bg-cream-100"           title="View">  <Eye   size={13} /></button>
                                                    <button onClick={() => handleEdit(ing)}          className="p-1.5 rounded-lg hover:bg-cream-100"           title="Edit">  <Edit2 size={13} /></button>
                                                    <button onClick={() => handleDeleteRequest(ing)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={13} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {!loading && ingredients.length === 0 && (
                            <div className="text-center py-12 text-gray-400">No ingredients found.</div>
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

            {/* Create / Edit Drawer */}
            <IngredientFormDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                onSubmit={handleSubmit}
                ingredient={selectedIngredient}
            />

            {/* View Detail Modal */}
            <IngredientDetailModal
                open={!!detailIngredient}
                onClose={() => setDetailIngredient(null)}
                ingredient={detailIngredient}
                onEdit={(ing) => { setDetailIngredient(null); handleEdit(ing); }}
            />

            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                loading={deleteLoading}
                variant="danger"
                title="Delete ingredient?"
                description={`"${deleteTarget?.name}" will be permanently removed. This cannot be undone.`}
                confirmLabel="Yes, delete"
                cancelLabel="Keep it"
            />
        </>
    );
}
