import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const toastStyles = {
    success: {
        bar: "bg-emerald-500",
        iconColor: "text-emerald-500",
        icon: <CheckCircle2 size={18} />,
    },
    error: {
        bar: "bg-red-500",
        iconColor: "text-red-500",
        icon: <XCircle size={18} />,
    },
    warning: {
        bar: "bg-amber-400",
        iconColor: "text-amber-500",
        icon: <AlertTriangle size={18} />,
    },
    info: {
        bar: "bg-blue-500",
        iconColor: "text-blue-500",
        icon: <Info size={18} />,
    },
};

function ToastItem({ toast, onRemove }) {
    const style = toastStyles[toast.type];
    const timerRef = useRef();

    useEffect(() => {
        timerRef.current = setTimeout(() => onRemove(toast.id), toast.duration ?? 4000);
        return () => clearTimeout(timerRef.current);
    }, [toast.id, toast.duration, onRemove]);

    return (
        <div className="relative flex items-start gap-3 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 min-w-[280px] max-w-sm overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar} rounded-l-xl`} />
            <span className={`flex-shrink-0 mt-0.5 ${style.iconColor}`}>{style.icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
                {toast.message && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.message}</p>
                )}
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 p-0.5 text-gray-300 hover:text-gray-500 transition-colors"
                aria-label="Dismiss"
            >
                <X size={14} />
            </button>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const remove = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const add = useCallback((opts) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { ...opts, id }]);
    }, []);

    const value = {
        toast: add,
        success: (title, message) => add({ type: "success", title, message }),
        error: (title, message) => add({ type: "error", title, message }),
        warning: (title, message) => add({ type: "warning", title, message }),
        info: (title, message) => add({ type: "info", title, message }),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onRemove={remove} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}