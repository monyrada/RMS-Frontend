import { useEffect, useRef, useState, useCallback } from "react";
import {
    Plus, Search, Edit2, Trash2, Eye,
    LayoutGrid, LayoutList, ChevronDown, X, ShieldCheck,
} from "lucide-react";

import Pagination     from "../../../components/shared/pagination";
import RoleFormDrawer  from "../../../components/common/roles/RoleFormDrawer.jsx";
import RoleDetailModal from "../../../components/common/roles/RoleDetailModal.jsx";
import ConfirmDialog    from "../../../components/ui/ConfirmDialog.jsx";
import { useToast }     from "../../../components/ui/Toast.jsx";

import {
    getRoles, createRole, updateRole, deleteRole,
} from "../../../api/role/role.api.js";

/* Constants */
const DEBOUNCE_MS = 300;

const ENABLED_OPTIONS = [
    { label: "All Status", value: ""      },
    { label: "Enabled",    value: "true"  },
    { label: "Disabled",   value: "false" },
];

/* Helpers */
const enabledStyle = (enabled) =>
    enabled ? "bg-forest-300/20 text-forest-700" : "bg-red-100 text-red-600";

const initials = (role) => role.name?.[0]?.toUpperCase() || "?";

const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

/** How many advanced filters (just "enabled" for now) are active */
const countActive = ({ enabledFilter }) => [enabledFilter].filter((v) => v !== "").length;

/* Subcomponent — role badge icon (in place of UserAvatar) */
function RoleIcon() {
    return (
        <div className="w-8 h-8 rounded-full bg-forest-900 text-white flex items-center justify-center shrink-0">
            <ShieldCheck size={14} />
        </div>
    );
}

/* Subcomponent — skeleton rows (loading state) */
function SkeletonRows({ count = 8 }) {
    return Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="animate-pulse">
            <td className="table-td"><div className="w-8 h-8 rounded-full bg-cream-200" /></td>
            <td className="table-td"><div className="h-3 bg-cream-200 rounded w-32" /></td>
            <td className="table-td hidden sm:table-cell"><div className="h-3 bg-cream-200 rounded w-48" /></td>
            <td className="table-td hidden md:table-cell"><div className="h-3 bg-cream-200 rounded w-24" /></td>
            <td className="table-td"><div className="h-5 bg-cream-200 rounded-full w-16" /></td>
            <td className="table-td text-right"><div className="h-3 bg-cream-200 rounded w-16 ml-auto" /></td>
        </tr>
    ));
}

/*
   Subcomponent — inline advanced filter bar
   (Enabled — collapsible, same pattern as UserManagement's FilterBar,
   just a single filter since Role only has enabled/disabled)
 */
function FilterBar({ enabledFilter, onChange, onClear, show }) {
    const active = countActive({ enabledFilter });
    if (!show) return null;

    return (
        <div className="flex flex-wrap items-end gap-2 p-3 rounded-xl bg-cream-50 border border-cream-200">

            {/* Enabled */}
            <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</label>
                <div className="relative">
                    <select
                        value={enabledFilter}
                        onChange={(e) => onChange("enabledFilter", e.target.value)}
                        className="bg-white border border-cream-200 rounded-lg pl-3 pr-7 py-1.5 text-sm appearance-none focus:outline-none focus:border-forest-400 min-w-[130px]"
                    >
                        {ENABLED_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
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

function RoleCard({ role, onView, onEdit, onDelete }) {
    return (
        <div className="card p-4 flex gap-3">
            <RoleIcon />
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-forest-900 text-sm truncate">{role.name}</p>
                    <span className={`badge shrink-0 ${enabledStyle(role.enabled)}`}>
            {role.enabled ? "Enabled" : "Disabled"}
          </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{role.description || "No description"}</p>
                <p className="text-xs text-gray-400 mt-1">Updated {formatDate(role.updatedAt)}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => onView(role)}   className="p-1.5 rounded-lg hover:bg-cream-100"           title="View">  <Eye   size={13} /></button>
                <button onClick={() => onEdit(role)}   className="p-1.5 rounded-lg hover:bg-cream-100"           title="Edit">  <Edit2 size={13} /></button>
                <button onClick={() => onDelete(role)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={13} /></button>
            </div>
        </div>
    );
}

/* Main Component */

export default function RoleManagement() {
    const toast = useToast();

    /* List */
    const [roles,   setRoles]   = useState([]);
    const [total,   setTotal]   = useState(0);
    const [loading, setLoading] = useState(true);
    const [view,    setView]    = useState("table");

    /* Pagination */
    const [page,  setPage]  = useState(1);
    const [limit, setLimit] = useState(10);

    /* Filters */
    const [searchInput,     setSearchInput]     = useState("");   // raw input value
    const [debouncedSearch, setDebouncedSearch] = useState("");   // sent to API as `name`
    const [enabledFilter,   setEnabledFilter]   = useState("");   // "" | "true" | "false"
    const [showFilters,     setShowFilters]     = useState(false);

    /* Modals */
    const [drawerOpen,    setDrawerOpen]    = useState(false);
    const [selectedRole,  setSelectedRole]  = useState(null);
    const [detailRole,    setDetailRole]    = useState(null);
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

    /* Load roles — all params forwarded to API (name/enabled map to RoleSpecification filters) */
    const loadRoles = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getRoles({
                offset:  (page - 1) * limit,
                max:     limit,
                sort:    "name",
                order:   "asc",
                name:    debouncedSearch || undefined,
                enabled: enabledFilter    || undefined,
            });
            setRoles(res?.data?.data  || []);
            setTotal(res?.data?.total || 0);
        } catch {
            toast.error("Failed to load", "Could not load roles.");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, debouncedSearch, enabledFilter]);

    useEffect(() => { loadRoles(); }, [loadRoles]);

    /* Filter helpers */
    const handleFilterChange = (field, value) => {
        setPage(1);
        if (field === "enabledFilter") setEnabledFilter(value);
    };

    const clearAdvancedFilters = () => {
        setEnabledFilter(""); setPage(1);
    };

    /* CRUD handlers */
    const handleAdd         = ()     => { setSelectedRole(null); setDrawerOpen(true); };
    const handleEdit        = (role) => { setSelectedRole(role); setDrawerOpen(true); };
    const handleCloseDrawer = ()     => { setDrawerOpen(false);  setSelectedRole(null); };
    const handleView        = (role) => setDetailRole(role);

    const handleSubmit = async (formData) => {
        try {
            if (selectedRole) {
                await updateRole(selectedRole.id, formData);
                toast.success("Role updated", `"${formData.name}" was saved successfully.`);
            } else {
                await createRole(formData);
                toast.success("Role added", `"${formData.name}" was created successfully.`);
            }
            await loadRoles();
            handleCloseDrawer();
        } catch {
            toast.error("Save failed", "Please check your inputs and try again.");
        }
    };

    const handleDeleteRequest = (role) => setDeleteTarget({ id: role.id, name: role.name });

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await deleteRole(deleteTarget.id);
            toast.success("Role deleted", `"${deleteTarget.name}" was removed.`);
            // Reload instead of mutating local state — keeps total count accurate
            await loadRoles();
        } catch {
            toast.error("Delete failed", "Could not delete the role. Please try again.");
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    };

    /* Derived */
    const advancedActiveCount = countActive({ enabledFilter });

    /* Render */
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
                                placeholder="Search roles by name…"
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
                            <Plus size={14} /> <span>Add Role</span>
                        </button>
                    </div>

                    {/* Row 2 — advanced filter bar (collapsible) */}
                    <FilterBar
                        show={showFilters}
                        enabledFilter={enabledFilter}
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
                                        <div className="w-8 h-8 rounded-full bg-cream-200 shrink-0" />
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-3 bg-cream-200 rounded w-3/4" />
                                            <div className="h-2 bg-cream-200 rounded w-full" />
                                            <div className="h-2 bg-cream-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {roles.map((role) => (
                                        <RoleCard key={role.id} role={role} onView={handleView} onEdit={handleEdit} onDelete={handleDeleteRequest} />
                                    ))}
                                </div>
                                {roles.length === 0 && (
                                    <div className="card text-center py-12 text-gray-400">No roles found.</div>
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
                                    <th className="table-th hidden sm:table-cell">Description</th>
                                    <th className="table-th hidden md:table-cell">Updated</th>
                                    <th className="table-th">Status</th>
                                    <th className="table-th text-right">Actions</th>
                                </tr>
                                </thead>

                                <tbody>
                                {loading ? (
                                    <SkeletonRows count={limit} />
                                ) : (
                                    roles.map((role) => (
                                        <tr key={role.id} className="hover:bg-cream-50">
                                            <td className="table-td"><RoleIcon /></td>

                                            <td className="table-td font-medium">
                                                <span className="text-sm text-forest-900">{role.name}</span>
                                                <span className="sm:hidden block text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">
                                                    {role.description || "—"}
                                                </span>
                                            </td>

                                            <td className="table-td hidden sm:table-cell text-sm text-gray-600 truncate max-w-[240px]">
                                                {role.description || "—"}
                                            </td>
                                            <td className="table-td hidden md:table-cell text-sm text-gray-500 whitespace-nowrap">
                                                {formatDate(role.updatedAt)}
                                            </td>

                                            <td className="table-td">
                          <span className={`badge whitespace-nowrap ${enabledStyle(role.enabled)}`}>
                            {role.enabled ? "Enabled" : "Disabled"}
                          </span>
                                            </td>

                                            <td className="table-td">
                                                <div className="flex justify-end gap-1.5">
                                                    <button onClick={() => handleView(role)}          className="p-1.5 rounded-lg hover:bg-cream-100"           title="View">  <Eye   size={13} /></button>
                                                    <button onClick={() => handleEdit(role)}          className="p-1.5 rounded-lg hover:bg-cream-100"           title="Edit">  <Edit2 size={13} /></button>
                                                    <button onClick={() => handleDeleteRequest(role)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={13} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {!loading && roles.length === 0 && (
                            <div className="text-center py-12 text-gray-400">No roles found.</div>
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
            <RoleFormDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                onSubmit={handleSubmit}
                role={selectedRole}
            />

            {/* ── View Detail Modal ── */}
            <RoleDetailModal
                open={!!detailRole}
                onClose={() => setDetailRole(null)}
                role={detailRole}
                onEdit={(role) => { setDetailRole(null); handleEdit(role); }}
            />

            {/* ── Delete Confirm Dialog ── */}
            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                loading={deleteLoading}
                variant="danger"
                title="Delete role?"
                description={`"${deleteTarget?.name}" will be permanently removed. This cannot be undone.`}
                confirmLabel="Yes, delete"
                cancelLabel="Keep it"
            />
        </>
    );
}