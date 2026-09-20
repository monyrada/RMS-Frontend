import { ChevronDown, X } from "lucide-react";

/**
 * Generic advanced-filter bar used by list pages (Categories, Ingredients,
 * Items, Orders, Roles, Users, Tables, ...). Renders a "select" or "number"
 * field per entry in `fields`, plus a Clear button when any filter is active.
 *
 * fields: [{
 *   key,                 // passed back as onChange(key, value)
 *   label,               // field label
 *   type,                // "select" (default) | "number"
 *   value,
 *   options,              // [{ label, value }] — required for type "select"
 *   width,                // optional width/min-width class override
 *   placeholder, min, step, // number-only
 * }]
 */
export default function FilterBar({
    fields = [],
    activeCount = 0,
    onChange,
    onClear,
    show,
    clearLabel = "Clear",
    showClearCount = true,
}) {
    if (!show) return null;

    return (
        <div className="flex flex-wrap items-end gap-2 p-3 rounded-xl bg-cream-50 border border-cream-200">
            {fields.map((field) => (
                <div key={field.key} className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                        {field.label}
                    </label>

                    {field.type === "number" ? (
                        <input
                            type="number"
                            min={field.min ?? 0}
                            step={field.step ?? "0.01"}
                            placeholder={field.placeholder}
                            value={field.value}
                            onChange={(e) => onChange(field.key, e.target.value)}
                            className={`bg-white border border-cream-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-forest-400 ${field.width ?? "w-24"}`}
                        />
                    ) : (
                        <div className="relative">
                            <select
                                value={field.value}
                                onChange={(e) => onChange(field.key, e.target.value)}
                                className={`bg-white border border-cream-200 rounded-lg pl-3 pr-7 py-1.5 text-sm appearance-none focus:outline-none focus:border-forest-400 ${field.width ?? "min-w-[130px]"}`}
                            >
                                {field.options.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    )}
                </div>
            ))}

            {activeCount > 0 && (
                <button
                    onClick={onClear}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 pb-1.5 whitespace-nowrap"
                >
                    <X size={12} /> {clearLabel}{showClearCount ? ` (${activeCount})` : ""}
                </button>
            )}
        </div>
    );
}
