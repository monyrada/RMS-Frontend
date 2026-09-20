import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Search, Edit2, Trash2, Eye, Users, MapPin,
  LayoutGrid, LayoutList, ChevronDown, X, QrCode,
} from "lucide-react";

import Pagination        from "../../components/shared/pagination";
import FilterBar          from "../../components/shared/filter-bar.jsx";
import TableFormModal     from "../../components/common/table/modals/TableFormModal.jsx";
import TableDetailModal   from "../../components/common/table/modals/TableDetailModal.jsx";
import ConfirmDialog      from "../../components/ui/ConfirmDialog.jsx";
import { useToast }       from "../../components/ui/Toast.jsx";
import { TABLE_STATUS_CONFIG, tableStatusConfig } from "../../components/common/table/tableStatus.js";

import {
  getTables,
  getTableSummary,
  createTable,
  updateTable,
  deleteTable,
} from "../../api/table/table.api";

/* Constants */
const DEBOUNCE_MS = 300;

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  ...Object.entries(TABLE_STATUS_CONFIG).map(([value, cfg]) => ({ label: cfg.label, value })),
];

/** How many advanced filters (status) are active */
const countActive = ({ statusFilter }) => [statusFilter].filter(Boolean).length;

/**
 * Map the backend's TableSummaryResponse — { totalTables, available, occupied,
 * reserved, cleaning, inactive } — onto the TABLE_STATUS_CONFIG enum keys.
 */
function normalizeSummary(raw) {
  if (!raw) return { total: 0, AVAILABLE: 0, OCCUPIED: 0, RESERVED: 0, CLEANING: 0, INACTIVE: 0 };
  return {
    total:     raw.totalTables ?? 0,
    AVAILABLE: raw.available   ?? 0,
    OCCUPIED:  raw.occupied    ?? 0,
    RESERVED:  raw.reserved    ?? 0,
    CLEANING:  raw.cleaning    ?? 0,
    INACTIVE:  raw.inactive    ?? 0,
  };
}

/* Subcomponent — skeleton rows (loading state, list view) */
function SkeletonRows({ count = 8 }) {
  return Array.from({ length: count }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="table-td"><div className="w-8 h-8 rounded-lg bg-cream-200" /></td>
        <td className="table-td"><div className="h-3 bg-cream-200 rounded w-20" /></td>
        <td className="table-td hidden sm:table-cell"><div className="h-3 bg-cream-200 rounded w-32" /></td>
        <td className="table-td hidden md:table-cell"><div className="h-3 bg-cream-200 rounded w-12" /></td>
        <td className="table-td"><div className="h-5 bg-cream-200 rounded-full w-20" /></td>
        <td className="table-td"><div className="h-3 bg-cream-200 rounded w-16 ml-auto" /></td>
      </tr>
  ));
}

/* Main Component */

export default function Tables() {
  const toast = useToast();

  /* List */
  const [tables,  setTables]  = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [view,    setView]    = useState("floor"); // "floor" | "list"

  /* Summary cards */
  const [summary, setSummary] = useState({});

  /* Pagination */
  const [page,  setPage]  = useState(1);
  const [limit, setLimit] = useState(view === "floor" ? 20 : 10);

  /* Filters */
  const [searchInput,     setSearchInput]     = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter,    setStatusFilter]    = useState("");
  const [showFilters,     setShowFilters]     = useState(false);

  /* Floor grid selection */
  const [selected, setSelected] = useState(null);

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

  /* Load tables — all params forwarded to API */
  const loadTables = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTables({
        offset:  (page - 1) * limit,
        max:     limit,
        sort:    "tableNumber",
        order:   "asc",
        keyword: debouncedSearch || undefined,
        status:  statusFilter    || undefined,
      });
      setTables(res?.data?.data  || []);
      setTotal(res?.data?.total || 0);
    } catch {
      toast.error("Failed to load", "Could not load tables.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch, statusFilter]);

  const loadSummary = useCallback(async () => {
    try {
      const res = await getTableSummary();
      setSummary(normalizeSummary(res?.data?.data));
    } catch {
      /* Summary cards are a non-critical overview — fail quietly */
    }
  }, []);

  useEffect(() => { loadTables(); }, [loadTables]);
  useEffect(() => { loadSummary(); }, [loadSummary]);

  /* View toggle — floor and list use different default page sizes */
  const handleViewToggle = () => {
    setView((v) => {
      const next = v === "floor" ? "list" : "floor";
      setLimit(next === "floor" ? 20 : 10);
      setPage(1);
      return next;
    });
  };

  /* Filter helpers */
  const handleFilterChange = (field, value) => {
    setPage(1);
    if (field === "statusFilter") setStatusFilter(value);
  };

  const clearAdvancedFilters = () => {
    setStatusFilter(""); setPage(1);
  };

  /* CRUD handlers */
  const handleAdd       = ()      => { setSelectedItem(null); setFormOpen(true); };
  const handleEdit      = (t)     => { setSelectedItem(t);    setFormOpen(true); };
  const handleCloseForm = ()      => { setFormOpen(false);    setSelectedItem(null); };
  const handleView      = (t)     => setDetailItem(t);

  const handleSubmit = async (formData) => {
    try {
      if (selectedItem) {
        await updateTable(selectedItem.id, formData);
        toast.success("Table updated", `"${formData.tableNumber}" was saved successfully.`);
      } else {
        await createTable(formData);
        toast.success("Table added", `"${formData.tableNumber}" was added successfully.`);
      }
      await Promise.all([loadTables(), loadSummary()]);
      handleCloseForm();
    } catch {
      toast.error("Save failed", "Please check your inputs and try again.");
    }
  };

  const handleDeleteRequest = (t) => setDeleteTarget({ id: t.id, name: t.tableNumber });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTable(deleteTarget.id);
      toast.success("Table deactivated", `"${deleteTarget.name}" was deactivated.`);
      if (selected === deleteTarget.id) setSelected(null);
      await Promise.all([loadTables(), loadSummary()]);
    } catch {
      toast.error("Deactivate failed", "Could not deactivate the table. Please try again.");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  /* Derived */
  const advancedActiveCount = countActive({ statusFilter });
  const selectedTable = selected ? tables.find((t) => t.id === selected) : null;

  /* Render */
  return (
      <>
        <div className="space-y-4 fade-in">

          {/* ── Summary cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="card p-4 flex items-center gap-3 border-l-4 border-forest-900">
              <div>
                <p className="text-2xl font-black text-forest-900">{summary.total ?? 0}</p>
                <p className="text-xs text-gray-500">Total Tables</p>
              </div>
            </div>
            {Object.entries(TABLE_STATUS_CONFIG).map(([key, cfg]) => (
                <div key={key} className={`card p-4 flex items-center gap-3 border-l-4 ${cfg.border}`}>
                  <div>
                    <p className="text-2xl font-black text-forest-900">{summary[key] ?? 0}</p>
                    <p className="text-xs text-gray-500">{cfg.label}</p>
                  </div>
                </div>
            ))}
          </div>

          {/* ── Toolbar ── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={searchInput}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="Search by table number or location…"
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
                  onClick={handleViewToggle}
                  className="p-2 rounded-xl bg-white border border-cream-200 hover:border-forest-300 shrink-0"
                  title={view === "floor" ? "List view" : "Floor view"}
              >
                {view === "floor" ? <LayoutList size={15} /> : <LayoutGrid size={15} />}
              </button>

              <button onClick={handleAdd} className="btn-primary flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                <Plus size={14} /> <span>Add Table</span>
              </button>
            </div>

            <FilterBar
                show={showFilters}
                activeCount={advancedActiveCount}
                fields={[
                  { key: "statusFilter", label: "Status", value: statusFilter, options: STATUS_OPTIONS, width: "min-w-[150px]" },
                ]}
                onChange={handleFilterChange}
                onClear={clearAdvancedFilters}
            />
          </div>

          {/* ── Floor view ── */}
          {view === "floor" ? (
              <>
                <div className="card p-4 sm:p-5">
                  <h3 className="font-semibold text-forest-900 mb-4 text-sm">Floor Layout</h3>

                  {loading ? (
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2 sm:gap-3">
                        {Array.from({ length: limit }).map((_, i) => (
                            <div key={i} className="border-2 border-cream-200 rounded-xl p-2.5 sm:p-3 h-[68px] animate-pulse bg-cream-100" />
                        ))}
                      </div>
                  ) : tables.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">No tables found.</div>
                  ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2 sm:gap-3">
                        {tables.map((table) => {
                          const cfg = tableStatusConfig(table.status);
                          const isSelected = selected === table.id;
                          return (
                              <button
                                  key={table.id}
                                  onClick={() => setSelected(isSelected ? null : table.id)}
                                  className={`border-2 rounded-xl p-2.5 sm:p-3 text-left transition-all duration-200 hover:scale-105 active:scale-95 ${cfg.border} ${cfg.bg} ${isSelected ? "ring-2 ring-offset-1 ring-forest-500 scale-105" : ""}`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`font-black text-xs ${cfg.text}`}>{table.tableNumber}</span>
                                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  <Users size={9} className="text-gray-400" />
                                  <span className="text-xs text-gray-400">{table.capacity}</span>
                                </div>
                                {table.currentGuestName && (
                                    <p className="text-xs text-gray-400 truncate mt-0.5">{table.currentGuestName}</p>
                                )}
                              </button>
                          );
                        })}
                      </div>
                  )}
                </div>

                {/* Selected table detail */}
                {selectedTable && (() => {
                  const cfg = tableStatusConfig(selectedTable.status);
                  return (
                      <div className={`card border-2 ${cfg.border} p-4 slide-up`}>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-12 h-12 rounded-xl ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center shrink-0`}>
                              <span className={`font-black text-sm ${cfg.text}`}>{selectedTable.tableNumber}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-forest-900 truncate">{selectedTable.tableNumber} · {selectedTable.capacity} seats</p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                                <span className={`text-sm font-medium ${cfg.text}`}>{cfg.label}</span>
                                <span className="text-gray-300">·</span>
                                <span className="flex items-center gap-1 text-xs text-gray-500 truncate"><MapPin size={11} />{selectedTable.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {selectedTable.currentGuestName && (
                                <p className="text-xs text-gray-400 mr-2">{selectedTable.currentGuestName}</p>
                            )}
                            <button onClick={() => handleView(selectedTable)}          className="p-2 rounded-lg hover:bg-cream-100"           title="View QR / details"><QrCode size={15} /></button>
                            <button onClick={() => handleEdit(selectedTable)}          className="p-2 rounded-lg hover:bg-cream-100"           title="Edit">           <Edit2 size={15} /></button>
                            <button onClick={() => handleDeleteRequest(selectedTable)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Deactivate">     <Trash2 size={15} /></button>
                          </div>
                        </div>
                      </div>
                  );
                })()}

                <Pagination total={total} page={page} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
              </>

          ) : (
              /* ── List view ── */
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px]">
                    <thead className="border-b border-cream-200">
                    <tr>
                      <th className="table-th w-10" />
                      <th className="table-th">Table</th>
                      <th className="table-th hidden sm:table-cell">Location</th>
                      <th className="table-th hidden md:table-cell">Capacity</th>
                      <th className="table-th">Status</th>
                      <th className="table-th text-right">Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {loading ? (
                        <SkeletonRows count={limit} />
                    ) : (
                        tables.map((t) => {
                          const cfg = tableStatusConfig(t.status);
                          return (
                              <tr key={t.id} className="hover:bg-cream-50">
                                <td className="table-td">
                                  <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center ${cfg.bg} ${cfg.border}`}>
                                    <span className={`text-[10px] font-black ${cfg.text}`}>{t.tableNumber?.replace(/[^0-9]/g, "").slice(-2) || "•"}</span>
                                  </div>
                                </td>

                                <td className="table-td font-medium">
                                  <span className="text-sm text-forest-900">{t.tableNumber}</span>
                                  {!t.isActive && <span className="badge bg-gray-100 text-gray-500 ml-2">Deactivated</span>}
                                  <span className="sm:hidden flex items-center gap-1 text-xs text-gray-400 mt-0.5"><MapPin size={10} />{t.location}</span>
                                  <span className="md:hidden flex items-center gap-1 text-xs text-gray-400 mt-0.5"><Users size={10} />{t.capacity} seats</span>
                                </td>

                                <td className="table-td hidden sm:table-cell text-sm text-gray-500">{t.location}</td>
                                <td className="table-td hidden md:table-cell text-sm text-gray-500">{t.capacity}</td>

                                <td className="table-td">
                            <span className={`badge whitespace-nowrap ${cfg.bg} ${cfg.text}`}>
                              {cfg.label}
                            </span>
                                </td>

                                <td className="table-td">
                                  <div className="flex justify-end gap-1.5">
                                    <button onClick={() => handleView(t)}          className="p-1.5 rounded-lg hover:bg-cream-100"           title="View">      <Eye   size={13} /></button>
                                    <button onClick={() => handleEdit(t)}          className="p-1.5 rounded-lg hover:bg-cream-100"           title="Edit">      <Edit2 size={13} /></button>
                                    <button onClick={() => handleDeleteRequest(t)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Deactivate"><Trash2 size={13} /></button>
                                  </div>
                                </td>
                              </tr>
                          );
                        })
                    )}
                    </tbody>
                  </table>
                </div>

                {!loading && tables.length === 0 && (
                    <div className="text-center py-12 text-gray-400">No tables found.</div>
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
        <TableFormModal
            open={formOpen}
            onClose={handleCloseForm}
            onSubmit={handleSubmit}
            initial={selectedItem}
            mode={selectedItem ? "edit" : "create"}
        />

        {/* ── View Detail Modal ── */}
        <TableDetailModal
            open={!!detailItem}
            onClose={() => setDetailItem(null)}
            table={detailItem}
            onEdit={(t) => { setDetailItem(null); handleEdit(t); }}
        />

        {/* ── Delete Confirm Dialog ── */}
        <ConfirmDialog
            open={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDeleteConfirm}
            loading={deleteLoading}
            variant="danger"
            title="Deactivate table?"
            description={`"${deleteTarget?.name}" will be deactivated and hidden from QR ordering. Order history is kept.`}
            confirmLabel="Yes, deactivate"
            cancelLabel="Keep it"
        />
      </>
  );
}
