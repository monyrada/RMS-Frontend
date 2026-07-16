import { Check, X } from "lucide-react";

export default function StatusToggle({ checked, onChange, disabled = false }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`
                relative inline-flex items-center 
                w-12 h-6 rounded-full transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${
                checked
                    ? "bg-green-500 focus:ring-green-400"
                    : "bg-gray-300 focus:ring-gray-400"
            }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
        >
            {/* Toggle Circle */}
            <span
                className={`
                    inline-flex items-center justify-center
                    w-5 h-5 bg-white rounded-full shadow-md
                    transform transition-transform duration-200
                    ${
                    checked
                        ? "translate-x-6"
                        : "translate-x-0.5"
                }
                `}
            >
                {checked ? (
                    <Check size={12} className="text-green-600" />
                ) : (
                    <X size={12} className="text-gray-400" />
                )}
            </span>
        </button>
    );
}