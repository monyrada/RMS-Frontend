import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, Search, X } from "lucide-react";
import { getMenus } from "../../../api/menu/item.api";

const DEBOUNCE_MS = 300;

/**
 * Search box + result list for picking a menu item to add to an order.
 * Calls onAdd(menuItem) when a result is clicked — the caller decides
 * how quantity is captured (inline row, separate stepper, etc).
 */
export default function MenuItemPicker({ onAdd }) {
    const [keyword, setKeyword] = useState("");
    const [debounced, setDebounced] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceTimer = useRef(null);

    const handleInput = (value) => {
        setKeyword(value);
        setOpen(true);
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => setDebounced(value), DEBOUNCE_MS);
    };

    useEffect(() => () => clearTimeout(debounceTimer.current), []);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                const res = await getMenus({
                    offset: 0,
                    max: 8,
                    sort: "name",
                    order: "asc",
                    keyword: debounced || undefined,
                    status: "true",
                });
                if (cancelled) return;
                setResults(res?.data?.data || []);
            } catch {
                if (!cancelled) setResults([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [debounced]);

    return (
        <div className="relative">
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={keyword}
                    onChange={(e) => handleInput(e.target.value)}
                    onFocus={() => setOpen(true)}
                    placeholder="Search menu items to add…"
                    className="w-full pl-8 pr-8 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#1a4731]/20 focus:border-[#1a4731]"
                />
                {keyword && (
                    <button
                        type="button"
                        onClick={() => handleInput("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                    >
                        <X size={13} />
                    </button>
                )}
            </div>

            {open && (keyword || results.length > 0) && (
                <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-lg">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-400">
                            <Loader2 size={14} className="animate-spin" /> Searching…
                        </div>
                    ) : results.length === 0 ? (
                        <div className="py-4 text-center text-xs text-gray-400">No items found.</div>
                    ) : (
                        results.map((item) => (
                            <button
                                type="button"
                                key={item.id}
                                onClick={() => { onAdd(item); setOpen(false); setKeyword(""); }}
                                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                            >
                                <span className="min-w-0 truncate text-gray-700">{item.name}</span>
                                <span className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-forest-700">
                                    ${Number(item.price ?? 0).toFixed(2)}
                                    <Plus size={12} />
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
