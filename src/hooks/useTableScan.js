import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { scanTable } from "../api/table/table.api";

/**
 * Validates a `table` id against the public scan endpoint and syncs the
 * validated table number into cart context. Call this on whichever page a
 * table's QR code actually lands on (currently /menu — see
 * RestaurantTableService#buildQrUrl on the backend).
 *
 * @returns {{ status: "idle"|"loading"|"ready"|"blocked"|"invalid", result: object|null }}
 */
export function useTableScan(tableId) {
    const { dispatch } = useCart();
    const [status, setStatus] = useState(tableId ? "loading" : "idle");
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!tableId) {
            setStatus("idle");
            return;
        }

        let cancelled = false;
        setStatus("loading");

        scanTable(tableId)
            .then((res) => {
                if (cancelled) return;
                // The backend wraps even "not found" as HTTP 200 with data: null,
                // so a missing/invalid id shows up here rather than in .catch().
                const data = res?.data?.data;
                if (!data) {
                    setStatus("invalid");
                    return;
                }
                setResult(data);
                if (data.orderingEnabled) {
                    dispatch({ type: "SET_TABLE", tableId, tableNumber: data.tableNumber });
                    setStatus("ready");
                } else {
                    setStatus("blocked");
                }
            })
            .catch(() => { if (!cancelled) setStatus("invalid"); });

        return () => { cancelled = true; };
    }, [dispatch, tableId]);

    return { status, result };
}
