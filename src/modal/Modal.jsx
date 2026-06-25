import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
};

export default function Modal({
                                  open,
                                  onClose,
                                  title,
                                  subtitle,
                                  size = "md",
                                  children,
                                  showCloseButton = true,
                              }) {
    const overlayRef = useRef(null);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        if (open) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div
                className={`relative w-full ${sizeClasses[size]} bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]`}
                role="dialog"
                aria-modal="true"
            >
                {(title || showCloseButton) && (
                    <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
                        <div>
                            {title && (
                                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                            )}
                            {subtitle && (
                                <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                            )}
                        </div>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="ml-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                )}
                <div className="overflow-y-auto flex-1">{children}</div>
            </div>
        </div>
    );
}
