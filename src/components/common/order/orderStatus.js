/* Shared status presentation for orders (backend enum: PENDING | PREPARING | SERVED | PAID | CANCELLED) */
export const ORDER_STATUS_CONFIG = {
    PENDING:   { border: "border-gray-300",  bg: "bg-gray-100",         text: "text-gray-700",  dot: "bg-gray-400",  label: "Pending" },
    PREPARING: { border: "border-amber-400", bg: "bg-amber-100",        text: "text-amber-800", dot: "bg-amber-400", label: "Preparing" },
    SERVED:    { border: "border-blue-400",  bg: "bg-blue-100",         text: "text-blue-800",  dot: "bg-blue-400",  label: "Served" },
    PAID:      { border: "border-forest-400",bg: "bg-forest-300/30",    text: "text-forest-800",dot: "bg-forest-500",label: "Paid" },
    CANCELLED: { border: "border-red-300",   bg: "bg-red-100",          text: "text-red-700",   dot: "bg-red-400",   label: "Cancelled" },
};

export const orderStatusConfig = (status) =>
    ORDER_STATUS_CONFIG[String(status || "").toUpperCase()] ?? ORDER_STATUS_CONFIG.PENDING;

/** Statuses that mean the order is finished — no further edits/cancellation allowed. */
export const TERMINAL_ORDER_STATUSES = ["PAID", "CANCELLED"];
