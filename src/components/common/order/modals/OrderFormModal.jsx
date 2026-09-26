import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import Modal from "../../../../modal/Modal.jsx";
import MenuItemPicker from "../MenuItemPicker.jsx";
import { ORDER_STATUS_CONFIG } from "../orderStatus.js";
import { getTables } from "../../../../api/table/table.api";

const TAX_RATE = 0.1;

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_CONFIG).map(([value, cfg]) => ({
    value,
    label: cfg.label,
}));

function formatCurrency(value) {
    return `$${Number(value ?? 0).toFixed(2)}`;
}

export default function OrderFormModal({ open, onClose, onSubmit, initial = null, mode }) {
    const [tables, setTables] = useState([]);
    const [tableId, setTableId] = useState("");
    const [note, setNote] = useState("");
    const [status, setStatus] = useState("PENDING");
    const [items, setItems] = useState([]); // [{ menuId, name, price, quantity }]
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNote(initial?.note ?? "");
        setStatus(initial?.status ? String(initial.status).toUpperCase() : "PENDING");
        setTableId(initial?.tableId != null ? String(initial.tableId) : "");
        setItems([]);
        setErrors({});

        getTables({ offset: 0, max: 100, sort: "tableNumber", order: "asc" })
            .then((res) => setTables(res?.data?.data || []))
            .catch(() => setTables([]));
    }, [open, initial]);

    const handleAddItem = (menuItem) => {
        setItems((list) => {
            const existing = list.find((i) => i.menuId === menuItem.id);
            if (existing) {
                return list.map((i) =>
                    i.menuId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [
                ...list,
                { menuId: menuItem.id, name: menuItem.name, price: Number(menuItem.price ?? 0), quantity: 1 },
            ];
        });
        setErrors((e) => ({ ...e, items: undefined }));
    };

    const handleQtyChange = (menuId, quantity) => {
        if (quantity < 1) {
            setItems((list) => list.filter((i) => i.menuId !== menuId));
            return;
        }
        setItems((list) => list.map((i) => (i.menuId === menuId ? { ...i, quantity } : i)));
    };

    const handleRemoveItem = (menuId) => {
        setItems((list) => list.filter((i) => i.menuId !== menuId));
    };

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    function validate() {
        const errs = {};
        if (!tableId) errs.tableId = "Please select a table.";
        if (mode === "create" && items.length === 0) errs.items = "Add at least one item.";
        return errs;
    }

    async function handleSubmit() {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setLoading(true);
        try {
            if (mode === "create") {
                await onSubmit({
                    tableId,
                    orderType: "DINE_IN",
                    source: "STAFF",
                    note: note.trim() || undefined,
                    tax: Number(tax.toFixed(2)),
                    items: items.map((i) => ({ menuId: i.menuId, quantity: i.quantity })),
                });
            } else {
                await onSubmit({
                    tableId,
                    note: note.trim() || undefined,
                    status,
                });
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={mode === "create" ? "New order" : "Edit order"}
            subtitle={mode === "edit" && initial?.displayId ? `Editing ${initial.displayId}` : undefined}
            size="lg"
        >
            <div className="px-6 py-5 space-y-5">
                {/* Table + status */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Table <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={tableId}
                            onChange={(e) => setTableId(e.target.value)}
                            className={`w-full px-3 py-2.5 text-sm rounded-lg border bg-white transition-colors outline-none focus:ring-2 ${
                                errors.tableId
                                    ? "border-red-300 focus:ring-red-100"
                                    : "border-gray-200 focus:ring-[#1a4731]/20 focus:border-[#1a4731]"
                            }`}
                        >
                            <option value="">Select a table…</option>
                            {tables.map((t) => (
                                <option key={t.id} value={t.id}>{t.tableNumber}</option>
                            ))}
                        </select>
                        {errors.tableId && <p className="text-xs text-red-500 mt-1">{errors.tableId}</p>}
                    </div>

                    {mode === "edit" && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-[#1a4731]/20 focus:border-[#1a4731]"
                            >
                                {STATUS_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Note */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Note <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        placeholder="Allergies, special instructions…"
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 resize-none outline-none focus:ring-2 focus:ring-[#1a4731]/20 focus:border-[#1a4731]"
                    />
                </div>

                {/* Items — create only; existing orders manage items from the detail view */}
                {mode === "create" && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Items <span className="text-red-400">*</span>
                        </label>

                        <MenuItemPicker onAdd={handleAddItem} />
                        {errors.items && <p className="text-xs text-red-500 mt-1">{errors.items}</p>}

                        {items.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {items.map((i) => (
                                    <div key={i.menuId} className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-gray-700 truncate">{i.name}</p>
                                            <p className="text-xs text-gray-400">{formatCurrency(i.price)} each</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleQtyChange(i.menuId, i.quantity - 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
                                            >
                                                <Minus size={11} />
                                            </button>
                                            <span className="w-5 text-center text-sm font-semibold">{i.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleQtyChange(i.menuId, i.quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
                                            >
                                                <Plus size={11} />
                                            </button>
                                            <span className="w-14 text-right text-sm font-bold text-forest-800">
                                                {formatCurrency(i.price * i.quantity)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(i.menuId)}
                                                className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="border-t border-gray-100 pt-2 space-y-1 text-sm">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500">
                                        <span>Tax (10%)</span><span>{formatCurrency(tax)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-forest-900">
                                        <span>Total</span><span>{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-5 py-2 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-60"
                    style={{ backgroundColor: "#1a4731" }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#153d29")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1a4731")}
                >
                    {loading ? "Saving..." : mode === "create" ? "Create order" : "Save changes"}
                </button>
            </div>
        </Modal>
    );
}
