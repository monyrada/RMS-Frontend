/**
 * Local (per-device) record of orders this customer has placed, keyed off
 * localStorage since customer ordering has no login. Used to power the
 * Order History page without asking the backend to filter orders by table
 * (which could otherwise leak other diners' orders at a shared table).
 */
const STORAGE_KEY = "rms_order_history";
const MAX_ENTRIES = 50;

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // storage unavailable (private mode, quota) — history just won't persist
  }
}

/** Records a newly placed order. Call right after a successful createOrder(). */
export function recordOrder({ id, orderNumber, tableId, tableNumber, total, itemCount, items, status, note }) {
  if (!id) return;

  const entries = readAll().filter((entry) => entry.id !== id);
  entries.unshift({
    id,
    orderNumber: orderNumber || null,
    tableId: tableId ?? null,
    tableNumber: tableNumber ?? null,
    total: Number(total) || 0,
    itemCount: Number(itemCount) || 0,
    items: Array.isArray(items)
      ? items.map((item) => ({ name: item.name, qty: Number(item.qty) || 1, unitPrice: Number(item.unitPrice) || 0 }))
      : [],
    status: status || "PENDING",
    note: note || "",
    createdAt: new Date().toISOString(),
  });
  writeAll(entries);
}

/** Returns saved order entries, newest first, optionally scoped to one table. */
export function getOrderHistory(tableId) {
  const entries = readAll();
  if (!tableId) return entries;
  return entries.filter((entry) => String(entry.tableId) === String(tableId));
}
