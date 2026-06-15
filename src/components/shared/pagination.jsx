export default function Pagination({ total, page, limit, onPageChange, onLimitChange }) {
    const totalPages = Math.ceil(total / limit);

    const pages = () => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
        if (page >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, "...", page - 1, page, page + 1, "...", totalPages];
    };

    return (
        <div className="flex items-center justify-between px-1 py-3">

            {/* Left — rows per page + info */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">Rows per page</span>
                <select value={limit}
                    onChange={(e) => {
                        onLimitChange(Number(e.target.value));
                        onPageChange(1);
                    }} className="text-xs border border-cream-200 rounded-lg px-2 py-1 bg-white outline-none focus:border-forest-400">

                    {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
                <span className="text-xs text-gray-400">
          {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
        </span>
            </div>

            {/* Right — page buttons */}
            <div className="flex items-center gap-1">

                {/* Prev */}
                <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs border border-cream-200 bg-white hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed">
                    ‹
                </button>

                {/* Page numbers */}
                {pages().map((p, i) =>
                        p === "..." ? (
                            <span key={`dot-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">
                                …
                            </span>
                        ) : (
                            <button key={p} onClick={() => onPageChange(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors
                            ${page === p ? "bg-forest-700 text-white border border-forest-700" 
                                : "border border-cream-200 bg-white hover:bg-cream-100 text-gray-600"}`}>
                                {p}
                            </button>
                        )
                )}

                {/* Next */}
                <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs border border-cream-200 bg-white hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed">
                    ›
                </button>
            </div>
        </div>
    );
}