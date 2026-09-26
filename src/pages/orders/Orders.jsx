import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  X,
  LayoutGrid,
  LayoutList,
  ShoppingBag,
  Clock,
  Users,
  Eye,
  Ban,
} from "lucide-react";

import Pagination from "../../components/shared/pagination";
import { useToast } from "../../components/ui/Toast.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import OrderFormModal from "../../components/common/order/modals/OrderFormModal.jsx";
import OrderDetailModal from "../../components/common/order/modals/OrderDetailModal.jsx";
import { getOrders, createOrder, updateOrder, cancelOrder } from "../../api/order/order.api";

/* =========================================================
 * Constants
 * ========================================================= */

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Served", value: "SERVED" },
  { label: "Paid", value: "PAID" },
  { label: "Cancelled", value: "CANCELLED" },
];

const SOURCE_OPTIONS = [
  { label: "All Sources", value: "" },
  { label: "Staff", value: "STAFF" },
  { label: "Customer QR", value: "CUSTOMER_QR" },
];

const SORT_OPTIONS = [
  { label: "Newest first", sort: "createdAt", order: "desc" },
  { label: "Oldest first", sort: "createdAt", order: "asc" },
  { label: "Total: high → low", sort: "totalAmount", order: "desc" },
  { label: "Total: low → high", sort: "totalAmount", order: "asc" },
];

const statusColors = {
  preparing: "bg-amber-100 text-amber-800",
  served: "bg-blue-100 text-blue-800",
  pending: "bg-gray-100 text-gray-700",
  paid: "bg-forest-300/30 text-forest-800",
  cancelled: "bg-red-100 text-red-700",
};

const statusDot = {
  preparing: "bg-amber-400",
  served: "bg-blue-400",
  pending: "bg-gray-400",
  paid: "bg-forest-500",
  cancelled: "bg-red-400",
};

const SOURCE_LABEL = {
  STAFF: "Staff",
  CUSTOMER_QR: "QR order",
};

const POLL_MS = 15000;

/* =========================================================
 * Helpers
 * ========================================================= */

function normalizeOrder(o) {
  return {
    id: o.id,
    displayId: o.orderNumber ?? `#${o.id ?? "—"}`,
    tableId: o.tableId ?? o.table?.id ?? null,
    table: o.tableNumber ?? "—",
    itemCount: Array.isArray(o.items) ? o.items.length : 0,
    total: Number(o.totalAmount ?? 0),
    status: (o.status || "pending").toLowerCase(),
    source: o.source ?? null,
    server:
        o.server ??
        o.serverName ??
        o.createdBy?.name ??
        o.user?.name ??
        "—",
    createdAtRaw: o.createdAt ?? null,
    time: o.createdAt
        ? new Date(o.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        : "—",
  };
}

function formatCurrency(value) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function timeAgo(iso) {
  if (!iso) return "—";

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "—";

  const mins = Math.floor((Date.now() - date.getTime()) / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

function getStatusColor(status) {
  return statusColors[status] || "bg-gray-100 text-gray-700";
}

function getStatusDot(status) {
  return statusDot[status] || "bg-gray-400";
}

function countActive({ source }) {
  return source ? 1 : 0;
}

function isTerminalStatus(status) {
  return status === "paid" || status === "cancelled";
}

/* =========================================================
 * Order Card
 * ========================================================= */

function OrderCard({ order, onClick, onCancel }) {
  const elapsedMin = order.createdAtRaw
      ? Math.floor(
          (Date.now() - new Date(order.createdAtRaw).getTime()) / 60000
      )
      : null;

  const isStale =
      ["pending", "preparing"].includes(order.status) &&
      elapsedMin !== null &&
      elapsedMin >= 15;

  return (
      <div
          onClick={() => onClick?.(order)}
          className="
        card
        relative
        overflow-hidden
        flex
        flex-col
        gap-3
        pl-4
        py-3.5
        pr-3
        active:bg-cream-50
        cursor-pointer
        transition-colors
        hover:shadow-sm
      "
      >
      <span
          className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusDot(
              order.status
          )}`}
      />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-forest-300 bg-forest-900 rounded-lg px-2 py-1 shrink-0">
            {order.table}
          </span>

            <span className="font-semibold text-forest-900 text-sm truncate">
            {order.displayId}
          </span>
          </div>

          <span
              className={`badge text-xs capitalize shrink-0 ${getStatusColor(
                  order.status
              )}`}
          >
          {order.status}
        </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-gray-400 min-w-0">
          <span className="flex items-center gap-1 shrink-0">
            <ShoppingBag size={12} />
            {order.itemCount}{" "}
            {order.itemCount === 1 ? "item" : "items"}
          </span>

            {order.source && (
                <span className="hidden sm:flex items-center gap-1 truncate">
              <Users size={12} />
                  {SOURCE_LABEL[order.source] ?? order.source}
            </span>
            )}

            {elapsedMin !== null && (
                <span
                    className={`flex items-center gap-1 shrink-0 ${
                        isStale ? "text-red-500 font-semibold" : ""
                    }`}
                >
              <Clock size={12} />
                  {timeAgo(order.createdAtRaw)}
            </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
          {!isTerminalStatus(order.status) && (
              <button
                  onClick={(e) => { e.stopPropagation(); onCancel?.(order); }}
                  title="Cancel order"
                  className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"
              >
                <Ban size={13} />
              </button>
          )}
          <span className="font-bold text-forest-900 text-base">
            {formatCurrency(order.total)}
          </span>

            <ChevronRight size={14} className="text-gray-300" />
          </div>
        </div>
      </div>
  );
}

/* =========================================================
 * Skeleton Rows
 * ========================================================= */

function SkeletonRows({ count = 8 }) {
  return Array.from({ length: count }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="table-td">
          <div className="h-3 bg-cream-200 rounded w-24" />
        </td>
        <td className="table-td">
          <div className="h-5 bg-cream-200 rounded-lg w-14" />
        </td>
        <td className="table-td">
          <div className="h-3 bg-cream-200 rounded w-16" />
        </td>
        <td className="table-td text-right">
          <div className="h-3 bg-cream-200 rounded w-12 ml-auto" />
        </td>
        <td className="table-td hidden sm:table-cell">
          <div className="h-3 bg-cream-200 rounded w-16" />
        </td>
        <td className="table-td">
          <div className="h-3 bg-cream-200 rounded w-16" />
        </td>
        <td className="table-td">
          <div className="h-5 bg-cream-200 rounded-full w-20" />
        </td>
        <td className="table-td">
          <div className="h-3 bg-cream-200 rounded w-12 ml-auto" />
        </td>
      </tr>
  ));
}

/* =========================================================
 * Filter Bar
 * ========================================================= */

function FilterBar({ source, sortKey, onChange, onClear, show }) {
  const active = countActive({ source });

  if (!show) return null;

  return (
      <div className="flex flex-wrap items-end gap-2 p-3 rounded-xl bg-cream-50 border border-cream-200">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            Source
          </label>

          <div className="relative">
            <select
                value={source}
                onChange={(e) => onChange("source", e.target.value)}
                className="bg-white border border-cream-200 rounded-lg pl-3 pr-7 py-1.5 text-sm appearance-none focus:outline-none focus:border-forest-400 min-w-[140px]"
            >
              {SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
              ))}
            </select>

            <ChevronDown
                size={13}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            Sort by
          </label>

          <div className="relative">
            <select
                value={sortKey}
                onChange={(e) => onChange("sortKey", e.target.value)}
                className="bg-white border border-cream-200 rounded-lg pl-3 pr-7 py-1.5 text-sm appearance-none focus:outline-none focus:border-forest-400 min-w-[170px]"
            >
              {SORT_OPTIONS.map((option, index) => (
                  <option key={index} value={index}>
                    {option.label}
                  </option>
              ))}
            </select>

            <ChevronDown
                size={13}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        {active > 0 && (
            <button
                onClick={onClear}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 pb-1.5 whitespace-nowrap"
            >
              <X size={12} />
              Clear
            </button>
        )}
      </div>
  );
}

/* =========================================================
 * Main Component
 * ========================================================= */

export default function Orders() {
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState("table");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [statusFilter, setStatusFilter] = useState("");
  const [source, setSource] = useState("");
  const [sortKey, setSortKey] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOrderId, setDetailOrderId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const prevTotalRef = useRef(null);

  const loadOrders = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      const { sort, order } =
      SORT_OPTIONS[sortKey] ?? SORT_OPTIONS[0];

      const res = await getOrders({
        offset: (page - 1) * limit,
        max: limit,
        sort,
        order,
        status: statusFilter || undefined,
        source: source || undefined,
      });

      const body = res?.data ?? res;

      const orderList = Array.isArray(body?.data)
          ? body.data
          : [];

      const newTotal = Number(body?.total ?? 0);

      if (silent && prevTotalRef.current != null && newTotal > prevTotalRef.current) {
        const arrived = newTotal - prevTotalRef.current;

        toast.success(
            arrived === 1 ? "New order received" : `${arrived} new orders received`,
            "The orders list has been refreshed."
        );
      }
      prevTotalRef.current = newTotal;

      setOrders(orderList.map(normalizeOrder));
      setTotal(newTotal);
    } catch (error) {
      console.error("Failed to load orders:", error);

      if (!silent) {
        toast.error(
            "Failed to load",
            "Could not load orders."
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, limit, statusFilter, source, sortKey, toast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Poll in the background so new customer orders show up without a manual refresh.
  useEffect(() => {
    const interval = setInterval(() => loadOrders({ silent: true }), POLL_MS);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleStatusTab = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleFilterChange = (field, value) => {
    setPage(1);

    if (field === "source") {
      setSource(value);
    }

    if (field === "sortKey") {
      setSortKey(Number(value));
    }
  };

  const clearAdvancedFilters = () => {
    setSource("");
    setSortKey(0);
    setPage(1);
  };

  const advancedActiveCount = countActive({ source });

  const handleOrderClick = (order) => {
    setDetailOrderId(order.id);
  };

  const handleAddOrder = () => {
    setFormMode("create");
    setSelectedOrder(null);
    setFormOpen(true);
  };

  const handleEditOrder = (order) => {
    setDetailOrderId(null);
    setFormMode("edit");
    setSelectedOrder(order);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedOrder(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (formMode === "edit") {
        await updateOrder(selectedOrder.id, formData);
        toast.success("Order updated", `${selectedOrder.displayId} was saved successfully.`);
      } else {
        await createOrder(formData);
        toast.success("Order created", "The new order was sent to the kitchen.");
      }
      await loadOrders();
      handleCloseForm();
    } catch (error) {
      toast.error(
          "Save failed",
          error?.response?.data?.message || "Please check your inputs and try again."
      );
    }
  };

  const handleRequestCancel = (order) => {
    setDetailOrderId(null);
    setCancelTarget(order);
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await cancelOrder(cancelTarget.id);
      toast.success("Order cancelled", `${cancelTarget.displayId} has been cancelled.`);
      await loadOrders();
    } catch {
      toast.error("Cancel failed", "Could not cancel the order. Please try again.");
    } finally {
      setCancelLoading(false);
      setCancelTarget(null);
    }
  };

  return (
      <>
      <div className="space-y-4 fade-in">
        {/* Toolbar */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {/* Status tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
              {STATUS_TABS.map((tab) => (
                  <button
                      key={tab.value}
                      onClick={() => handleStatusTab(tab.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                          statusFilter === tab.value
                              ? "bg-forest-700 text-white"
                              : "bg-white text-gray-600 border border-cream-200 hover:bg-cream-50"
                      }`}
                  >
                    {tab.label}
                  </button>
              ))}
            </div>

            {/* Filter toggle */}
            <button
                onClick={() => setShowFilters((value) => !value)}
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
                  <ChevronDown
                      size={13}
                      className={`transition-transform ${
                          showFilters ? "rotate-180" : ""
                      }`}
                  />
              )}
            </button>

            {/* View toggle */}
            <button
                onClick={() =>
                    setView((value) =>
                        value === "table" ? "cards" : "table"
                    )
                }
                className="p-2 rounded-xl bg-white border border-cream-200 hover:border-forest-300 shrink-0"
                title={view === "table" ? "Card view" : "Table view"}
            >
              {view === "table" ? (
                  <LayoutGrid size={15} />
              ) : (
                  <LayoutList size={15} />
              )}
            </button>

            {/* Refresh */}
            <button
                onClick={loadOrders}
                disabled={loading}
                className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3"
            >
              <RefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* New order */}
            <button
                onClick={handleAddOrder}
                className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">New Order</span>
            </button>
          </div>

          <FilterBar
              show={showFilters}
              source={source}
              sortKey={sortKey}
              onChange={handleFilterChange}
              onClear={clearAdvancedFilters}
          />
        </div>

        {/* Card View */}
        {view === "cards" ? (
            <>
              {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {Array.from({ length: limit }).map((_, index) => (
                        <div
                            key={index}
                            className="card p-4 flex gap-3 animate-pulse"
                        >
                          <div className="w-10 h-10 rounded-xl bg-cream-200 shrink-0" />

                          <div className="flex-1 space-y-2 py-1">
                            <div className="h-3 bg-cream-200 rounded w-2/3" />
                            <div className="h-2 bg-cream-200 rounded w-1/2" />
                          </div>
                        </div>
                    ))}
                  </div>
              ) : orders.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onClick={handleOrderClick}
                            onCancel={handleRequestCancel}
                        />
                    ))}
                  </div>
              ) : (
                  <div className="card text-center py-12 text-gray-400">
                    No orders found.
                  </div>
              )}

              <Pagination
                  total={total}
                  page={page}
                  limit={limit}
                  onPageChange={setPage}
                  onLimitChange={(value) => {
                    setLimit(value);
                    setPage(1);
                  }}
              />
            </>
        ) : (
            /* Table View */
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead className="border-b border-cream-200">
                  <tr>
                    <th className="table-th">Order ID</th>
                    <th className="table-th">Table</th>
                    <th className="table-th">Items</th>
                    <th className="table-th text-right">Total</th>
                    <th className="table-th hidden sm:table-cell">
                      Server
                    </th>
                    <th className="table-th">Time</th>
                    <th className="table-th">Status</th>
                    <th className="table-th text-right">Actions</th>
                  </tr>
                  </thead>

                  <tbody>
                  {loading ? (
                      <SkeletonRows count={limit} />
                  ) : (
                      orders.map((order) => (
                          <tr
                              key={order.id}
                              onClick={() => handleOrderClick(order)}
                              className="hover:bg-cream-50/60 transition-colors cursor-pointer"
                          >
                            <td className="table-td font-semibold text-forest-900 text-sm">
                              {order.displayId}
                            </td>

                            <td className="table-td">
                        <span className="bg-forest-900 text-forest-300 text-xs font-bold px-2 py-1 rounded-lg">
                          {order.table}
                        </span>
                            </td>

                            <td className="table-td text-gray-500 text-sm">
                              {order.itemCount}{" "}
                              {order.itemCount === 1 ? "item" : "items"}
                            </td>

                            <td className="table-td text-right font-bold text-forest-800">
                              {formatCurrency(order.total)}
                            </td>

                            <td className="table-td hidden sm:table-cell text-gray-500 text-sm">
                              {order.server}
                            </td>

                            <td className="table-td text-gray-400 text-sm">
                              {order.time}
                            </td>

                            <td className="table-td">
                              <div className="flex items-center gap-1.5">
                          <span
                              className={`w-1.5 h-1.5 rounded-full ${getStatusDot(
                                  order.status
                              )}`}
                          />

                                <span
                                    className={`badge capitalize ${getStatusColor(
                                        order.status
                                    )}`}
                                >
                            {order.status}
                          </span>
                              </div>
                            </td>

                            <td className="table-td" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-1.5">
                                <button
                                    onClick={() => handleOrderClick(order)}
                                    className="p-1.5 rounded-lg hover:bg-cream-100"
                                    title="View details"
                                >
                                  <Eye size={13} />
                                </button>
                                {!isTerminalStatus(order.status) && (
                                    <button
                                        onClick={() => handleRequestCancel(order)}
                                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                                        title="Cancel order"
                                    >
                                      <Ban size={13} />
                                    </button>
                                )}
                              </div>
                            </td>
                          </tr>
                      ))
                  )}
                  </tbody>
                </table>
              </div>

              {!loading && orders.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    No orders found.
                  </div>
              )}

              <div className="border-t border-cream-200 px-4">
                <Pagination
                    total={total}
                    page={page}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={(value) => {
                      setLimit(value);
                      setPage(1);
                    }}
                />
              </div>
            </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <OrderFormModal
          open={formOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          initial={selectedOrder}
          mode={formMode}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
          open={!!detailOrderId}
          orderId={detailOrderId}
          onClose={() => setDetailOrderId(null)}
          onEdit={handleEditOrder}
          onRequestCancel={handleRequestCancel}
          onChanged={loadOrders}
      />

      {/* Cancel Confirm Dialog */}
      <ConfirmDialog
          open={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancelConfirm}
          loading={cancelLoading}
          variant="danger"
          title="Cancel order?"
          description={`${cancelTarget?.displayId ?? "This order"} will be marked as cancelled. This cannot be undone.`}
          confirmLabel="Yes, cancel it"
          cancelLabel="Keep it"
      />
      </>
  );
}
