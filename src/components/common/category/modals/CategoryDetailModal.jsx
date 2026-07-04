import { Tag, ToggleLeft, ToggleRight } from "lucide-react";
import Modal from "../../../../modal/Modal.jsx";

export default function CategoryDetailModal({
                                                open,
                                                onClose,
                                                category,
                                                itemCount = 0,
                                                onEdit,
                                            }) {
    if (!category) return null;

    return (
        <Modal open={open} onClose={onClose} title="Category details" size="sm">
            <div className="px-6 py-5 space-y-5">
                {/* Color swatch + name */}
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: category.color ?? "#1a4731" }}
                    />
                    <div>
                        <p className="font-semibold text-gray-900">{category.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                {/* Description */}
                {category.description && (
                    <div className="bg-gray-50 rounded-lg px-4 py-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Tag size={11} /> Description
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">{category.description}</p>
                    </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">Status</span>
                    <span
                        className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                            category.isActive ? "text-emerald-600" : "text-gray-400"
                        }`}
                    >
            {category.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        {category.isActive ? "Active" : "Inactive"}
          </span>
                </div>
            </div>

            {onEdit && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
                    <button
                        onClick={() => { onClose(); onEdit(category); }}
                        className="px-5 py-2 text-sm font-medium rounded-lg text-white transition-colors"
                        style={{ backgroundColor: "#1a4731" }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#153d29")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1a4731")}
                    >
                        Edit category
                    </button>
                </div>
            )}
        </Modal>
    );
}