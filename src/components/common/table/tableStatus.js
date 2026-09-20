/* Shared status presentation for restaurant tables (backend enum: AVAILABLE | OCCUPIED | RESERVED | CLEANING | INACTIVE) */
export const TABLE_STATUS_CONFIG = {
    AVAILABLE: { border: "border-forest-400", bg: "bg-forest-400/10", text: "text-forest-700", dot: "bg-forest-400", label: "Available" },
    OCCUPIED:  { border: "border-amber-400",  bg: "bg-amber-400/10",  text: "text-amber-700",  dot: "bg-amber-400",  label: "Occupied" },
    RESERVED:  { border: "border-blue-400",   bg: "bg-blue-50",       text: "text-blue-700",   dot: "bg-blue-400",   label: "Reserved" },
    CLEANING:  { border: "border-gray-300",   bg: "bg-gray-50",       text: "text-gray-500",   dot: "bg-gray-300",   label: "Cleaning" },
    INACTIVE:  { border: "border-red-300",    bg: "bg-red-50",        text: "text-red-500",    dot: "bg-red-300",    label: "Inactive" },
};

export const tableStatusConfig = (status) => TABLE_STATUS_CONFIG[status] ?? TABLE_STATUS_CONFIG.AVAILABLE;
