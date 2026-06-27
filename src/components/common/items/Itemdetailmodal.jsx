import { DollarSign, Tag, Clock, Pencil, Info } from "lucide-react";
import Modal from "../../../modal/Modal.jsx";

/* ── Helpers ── */
function formatDate(raw) {
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d) ? raw : d.toLocaleDateString("en-GB", {
        day:   "2-digit",
        month: "short",
        year:  "numeric",
        hour:  "2-digit",
        minute:"2-digit",
    });
}

function Badge({ status }) {
    const available = status === true || status === "available";
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            available ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
        }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${available ? "bg-emerald-500" : "bg-red-500"}`} />
            {available ? "Available" : "Unavailable"}
        </span>
    );
}

function InfoCard({ icon, label, value }) {
    return (
        <div className="bg-cream-50 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
                {icon}
                <span className="text-[11px] uppercase tracking-wider font-medium">{label}</span>
            </div>
            <div className="text-sm font-medium text-gray-900">{value || "—"}</div>
        </div>
    );
}

/* ── Component ── */

export default function ItemDetailModal({ open, onClose, item, onEdit }) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={item?.name}
            subtitle={item?.categoryName}
            size="lg"
        >
            {item && (
                <>
                    {/* ── Image (only if exists) ── */}
                    {item.imageUrl && (
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-48 object-cover"
                        />
                    )}

                    <div className="p-5 space-y-4">

                        {/* ── Status + Price ── */}
                        <div className="flex items-center justify-between">
                            <Badge status={item.status} />
                            <span className="text-base font-semibold text-forest-900">
                                ${Number(item.price || 0).toFixed(2)}
                            </span>
                        </div>

                        {/* ── Description ── */}
                        {item.description && (
                            <div>
                                <p className="text-[11px] uppercase tracking-wider font-medium text-gray-400 mb-1.5">
                                    Description
                                </p>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        )}

                        {/* ── Info Cards ── */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <InfoCard
                                icon={<Tag size={13} />}
                                label="Category"
                                value={item.categoryName}
                            />
                            <InfoCard
                                icon={<DollarSign size={13} />}
                                label="Price"
                                value={`$${Number(item.price || 0).toFixed(2)}`}
                            />
                        </div>

                        {/* ── Meta ── */}
                        {(item.createdAt || item.updatedAt) && (
                            <div className="flex flex-col gap-1.5 pt-3 border-t border-cream-200">
                                {item.createdAt && (
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Clock size={12} />
                                        Created: {formatDate(item.createdAt)}
                                    </div>
                                )}
                                {item.updatedAt && (
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Info size={12} />
                                        Updated: {formatDate(item.updatedAt)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    {onEdit && (
                        <div className="px-5 py-4 border-t border-cream-200 bg-cream-50/50 flex items-center justify-between">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-cream-200 hover:bg-cream-100 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => { onClose(); onEdit(item); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors"
                                style={{ backgroundColor: "#1a4731" }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#153d29")}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1a4731")}
                            >
                                <Pencil size={13} />
                                Edit item
                            </button>
                        </div>
                    )}
                </>
            )}
        </Modal>
    );
}