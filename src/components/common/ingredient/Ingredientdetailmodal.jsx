import { Package, DollarSign, AlertTriangle, ToggleLeft, ToggleRight, FileText } from "lucide-react";
import Modal from "../../../modal/Modal.jsx";

function StockBar({ current, min }) {
    const max = Math.max(current, min * 3, 1);
    const pct = Math.min((current / max) * 100, 100);
    const isLow = current <= min;

    return (
        <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Stock level</span>
                <span className={isLow ? "text-amber-500 font-medium" : "text-gray-500"}>
          {current} / min {min}
        </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${isLow ? "bg-amber-400" : "bg-[#1a4731]"}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {isLow && (
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                    <AlertTriangle size={11} /> Stock is below minimum threshold
                </p>
            )}
        </div>
    );
}

export default function IngredientDetailModal({
                                                  open,
                                                  onClose,
                                                  ingredient,
                                                  onEdit,
                                              }) {
    if (!ingredient) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={ingredient.name}
            subtitle={`Measured in ${ingredient.unit}`}
            size="sm"
        >
            <div className="px-6 py-5 space-y-5">
                <StockBar current={ingredient.stockQuantity} min={ingredient.minStockLevel} />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-gray-400 mb-1"><Package size={15} /></div>
                        <p className="text-xs text-gray-500">Current stock</p>
                        <p className="text-lg font-semibold text-gray-900 mt-0.5">
                            {ingredient.stockQuantity}{" "}
                            <span className="text-sm text-gray-400">{ingredient.unit}</span>
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-[#1a4731] mb-1"><DollarSign size={15} /></div>
                        <p className="text-xs text-gray-500">Cost per unit</p>
                        <p className="text-lg font-semibold text-gray-900 mt-0.5">
                            ${ingredient.costPerUnit.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Notes */}
                {ingredient.notes && (
                    <div className="bg-gray-50 rounded-lg px-4 py-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <FileText size={11} /> Notes
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">{ingredient.notes}</p>
                    </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">Status</span>
                    <span
                        className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                            ingredient.isActive ? "text-emerald-600" : "text-gray-400"
                        }`}
                    >
            {ingredient.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        {ingredient.isActive ? "Active" : "Inactive"}
          </span>
                </div>
            </div>

            {onEdit && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
                    <button
                        onClick={() => { onClose(); onEdit(ingredient); }}
                        className="px-5 py-2 text-sm font-medium rounded-lg text-white transition-colors"
                        style={{ backgroundColor: "#1a4731" }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#153d29")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1a4731")}
                    >
                        Edit ingredient
                    </button>
                </div>
            )}
        </Modal>
    );
}