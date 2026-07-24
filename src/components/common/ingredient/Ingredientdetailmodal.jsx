import Modal from "../../../modal/Modal.jsx";
import { Edit2, Package, Clock } from "lucide-react";

const STATUS_STYLES = {
    IN_STOCK:     { label: "In Stock",     badge: "bg-forest-300/20 text-forest-700" },
    LOW_STOCK:    { label: "Low Stock",    badge: "bg-amber-100 text-amber-700"      },
    OUT_OF_STOCK: { label: "Out of Stock", badge: "bg-red-100 text-red-600"          },
};

const statusStyle = (s) => STATUS_STYLES[s]?.badge ?? "bg-gray-100 text-gray-600";
const statusLabel = (s) => STATUS_STYLES[s]?.label ?? s ?? "Unknown";

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function Row({ label, children }) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-cream-100 last:border-0">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
            <span className="text-sm text-forest-900 font-medium text-right">{children}</span>
        </div>
    );
}

export default function IngredientDetailModal({ open, onClose, ingredient, onEdit }) {
    if (!ingredient) return null;

    const { name, nameKh, description, unit, stockStatus, createdAt, updatedAt } = ingredient;

    return (
        <Modal open={open} onClose={onClose} title="Ingredient details" size="md">
            <div className="px-6 py-5 space-y-5">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-forest-900 flex items-center justify-center shrink-0">
                        <Package size={20} className="text-cream-100" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-forest-900 text-base truncate">{name}</h3>
                            {nameKh && <span className="text-sm text-gray-400">({nameKh})</span>}
                        </div>
                        <div className="mt-1.5">
              <span className={`badge text-xs ${statusStyle(stockStatus)}`}>
                {statusLabel(stockStatus)}
              </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {description && (
                    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                )}

                {/* Detail rows */}
                <div>
                    <Row label="Unit">{unit ?? "—"}</Row>
                </div>

                {/* Timestamps */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1">
                    <Clock size={12} />
                    <span>Created {formatDate(createdAt)}</span>
                    {updatedAt && updatedAt !== createdAt && (
                        <span>· Updated {formatDate(updatedAt)}</span>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-cream-200 bg-cream-50 rounded-b-xl flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-cream-200 text-gray-700 hover:bg-cream-100 transition-colors"
                >
                    Close
                </button>
                <button
                    onClick={() => onEdit?.(ingredient)}
                    className="btn-primary px-5 py-2 text-sm flex items-center gap-1.5"
                >
                    <Edit2 size={13} /> Edit
                </button>
            </div>
        </Modal>
    );
}