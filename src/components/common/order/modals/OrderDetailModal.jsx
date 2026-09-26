import { useCallback, useEffect, useState } from "react";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import Modal from "../../../../modal/Modal.jsx";
import MenuItemPicker from "../MenuItemPicker.jsx";
import { orderStatusConfig, TERMINAL_ORDER_STATUSES } from "../orderStatus.js";
import { useToast } from "../../../ui/Toast.jsx";
import {
    getOrderById,
    addOrderItem,
    updateOrderItem,
    removeOrderItem,
} from "../../../../api/order/order.api";

function formatCurrency(value) {
    return `$${Number(value ?? 0).toFixed(2)}`;
}

function normalizeItem(it) {
    return {
        id: it.id,
        menuId: it.menuId ?? it.itemId ?? it.menu?.id,
        name: it.menuName ?? it.itemName ?? it.name ?? it.menu?.name ?? "Item",
        price: Number(it.price ?? it.unitPrice ?? it.menu?.price ?? 0),
        quantity: Number(it.quantity ?? it.qty ?? 1),
    };
}

function normalizeOrder(o) {
    const items = (Array.isArray(o?.items) ? o.items : []).map(normalizeItem);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return {
        id: o?.id,
        displayId: o?.orderNumber ?? `#${o?.id ?? "—"}`,
        tableId: o?.tableId ?? o?.table?.id ?? null,
        tableNumber: o?.tableNumber ?? "—",
        status: (o?.status || "PENDING").toUpperCase(),
        source: o?.source ?? null,
        note: o?.note ?? "",
        createdAt: o?.createdAt ?? null,
        tax: Number(o?.tax ?? subtotal * 0.1),
        total: Number(o?.totalAmount ?? subtotal + Number(o?.tax ?? subtotal * 0.1)),
        subtotal,
        items,
    };
}

export default function OrderDetailModal({ open, orderId, onClose, onEdit, onRequestCancel, onChanged }) {
    const toast = useToast();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [busyItemId, setBusyItemId] = useState(null);
    const [addingItem, setAddingItem] = useState(false);

    const loadOrder = useCallback(async () => {
        if (!orderId) return;
        try {
            setLoading(true);
            const res = await getOrderById(orderId);
            setOrder(normalizeOrder(res?.data?.data ?? res?.data));
        } catch {
            toast.error("Failed to load", "Could not load this order.");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (open && orderId) loadOrder();
        if (!open) setOrder(null);
    }, [open, orderId, loadOrder]);

    if (!open) return null;

    const cfg = orderStatusConfig(order?.status);
    const isTerminal = TERMINAL_ORDER_STATUSES.includes(order?.status);

    const handleQtyChange = async (item, quantity) => {
        if (quantity < 1) return;
        setBusyItemId(item.id);
        try {
            await updateOrderItem(orderId, item.id, { quantity });
            await loadOrder();
            onChanged?.();
        } catch {
            toast.error("Update failed", "Could not update item quantity.");
        } finally {
            setBusyItemId(null);
        }
    };

    const handleRemoveItem = async (item) => {
        setBusyItemId(item.id);
        try {
            await removeOrderItem(orderId, item.id);
            toast.success("Item removed", `"${item.name}" was removed from the order.`);
            await loadOrder();
            onChanged?.();
        } catch {
            toast.error("Remove failed", "Could not remove this item.");
        } finally {
            setBusyItemId(null);
        }
    };

    const handleAddItem = async (menuItem) => {
        setAddingItem(true);
        try {
            await addOrderItem(orderId, { menuId: menuItem.id, quantity: 1 });
            toast.success("Item added", `"${menuItem.name}" was added to the order.`);
            await loadOrder();
            onChanged?.();
        } catch {
            toast.error("Add failed", "Could not add this item to the order.");
        } finally {
            setAddingItem(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="Order details" size="lg">
            {loading && !order ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
                    <Loader2 size={16} className="animate-spin" /> Loading order…
                </div>
            ) : order ? (
                <>
                    <div className="px-6 py-5 space-y-5">
                        {/* Header */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xs font-bold text-forest-300 bg-forest-900 rounded-lg px-2.5 py-1.5 shrink-0">
                                    {order.tableNumber}
                                </span>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{order.displayId}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                        <span className={`text-sm font-medium ${cfg.text}`}>{cfg.label}</span>
                                    </div>
                                </div>
                            </div>
                            {order.createdAt && (
                                <span className="text-xs text-gray-400 shrink-0">
                                    {new Date(order.createdAt).toLocaleString()}
                                </span>
                            )}
                        </div>

                        {order.note && (
                            <div className="bg-gray-50 rounded-lg px-4 py-3">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Note</p>
                                <p className="text-sm text-gray-700">{order.note}</p>
                            </div>
                        )}

                        {/* Items */}
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Items</p>

                            {order.items.length === 0 ? (
                                <p className="text-sm text-gray-400 py-3">No items on this order yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {order.items.map((item) => {
                                        const isBusy = busyItemId === item.id;
                                        return (
                                            <div key={item.id} className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm text-gray-700 truncate">{item.name}</p>
                                                    <p className="text-xs text-gray-400">{formatCurrency(item.price)} each</p>
                                                </div>

                                                {!isTerminal && (
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <button
                                                            type="button"
                                                            disabled={isBusy}
                                                            onClick={() => handleQtyChange(item, item.quantity - 1)}
                                                            className="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                                        >
                                                            <Minus size={11} />
                                                        </button>
                                                        <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                                                        <button
                                                            type="button"
                                                            disabled={isBusy}
                                                            onClick={() => handleQtyChange(item, item.quantity + 1)}
                                                            className="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                                        >
                                                            <Plus size={11} />
                                                        </button>
                                                        <span className="w-14 text-right text-sm font-bold text-forest-800">
                                                            {formatCurrency(item.price * item.quantity)}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            disabled={isBusy}
                                                            onClick={() => handleRemoveItem(item)}
                                                            className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-50"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                )}

                                                {isTerminal && (
                                                    <span className="w-14 text-right text-sm font-bold text-forest-800 shrink-0">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {!isTerminal && (
                                <div className="mt-3">
                                    <MenuItemPicker onAdd={handleAddItem} />
                                    {addingItem && (
                                        <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
                                            <Loader2 size={12} className="animate-spin" /> Adding item…
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Totals */}
                        <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Tax</span><span>{formatCurrency(order.tax)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-forest-900 text-base">
                                <span>Total</span><span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                        {!isTerminal && (
                            <button
                                onClick={() => onRequestCancel?.(order)}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            >
                                Cancel order
                            </button>
                        )}
                        <button
                            onClick={() => onEdit?.(order)}
                            className="px-5 py-2 text-sm font-medium rounded-lg text-white transition-colors"
                            style={{ backgroundColor: "#1a4731" }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#153d29")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1a4731")}
                        >
                            Edit order
                        </button>
                    </div>
                </>
            ) : (
                <div className="py-16 text-center text-sm text-gray-400">Order not found.</div>
            )}
        </Modal>
    );
}
