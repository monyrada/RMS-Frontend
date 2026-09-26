import { AlertTriangle, Trash2, Info } from "lucide-react";
import Modal from "../../modal/Modal.jsx";

const variantConfig = {
    danger: {
        icon: <Trash2 size={20} />,
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
        confirmBtn: "bg-red-500 hover:bg-red-600 text-white focus:ring-2 focus:ring-red-300",
    },
    warning: {
        icon: <AlertTriangle size={20} />,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-500",
        confirmBtn: "bg-amber-500 hover:bg-amber-600 text-white focus:ring-2 focus:ring-amber-300",
    },
    info: {
        icon: <Info size={20} />,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        confirmBtn: "bg-blue-500 hover:bg-blue-600 text-white focus:ring-2 focus:ring-blue-300",
    },
};

export default function ConfirmDialog({
                                          open,
                                          onClose,
                                          onConfirm,
                                          variant = "danger",
                                          title,
                                          description,
                                          confirmLabel = "Confirm",
                                          cancelLabel = "Cancel",
                                          loading = false,
                                      }) {

    const config = variantConfig[variant];

    return (
        <Modal open={open} onClose={onClose} size="sm" showCloseButton={false}>
            <div className="p-6 flex flex-col items-center text-center gap-4">
                <div className={`p-3 rounded-full ${config.iconBg} ${config.iconColor}`}>
                    {config.icon}
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
                </div>
                <div className="flex gap-3 w-full mt-1">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-60 ${config.confirmBtn}`}
                    >
                        {loading ? "Processing..." : confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}