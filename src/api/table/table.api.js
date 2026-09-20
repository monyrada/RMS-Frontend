import apiClient from "../apiClient.js";

/**
 * Get Tables
 * Supports offset/max pagination, sort/order, keyword (table number / location),
 * status (AVAILABLE | OCCUPIED | RESERVED | CLEANING | INACTIVE) and isActive filters.
 */
export const getTables = (params = {}) => {
    return apiClient.get("/tables", { params });
};

/**
 * Get Table By ID
 */
export const getTableById = (id) => {
    return apiClient.get(`/tables/${id}`);
};

/**
 * Create Table
 */
export const createTable = (payload) => {
    return apiClient.post("/tables", payload);
};

/**
 * Update Table
 */
export const updateTable = (id, payload) => {
    return apiClient.put(`/tables/${id}`, payload);
};

/**
 * Deactivate Table (soft delete — keeps order history intact)
 */
export const deleteTable = (id) => {
    return apiClient.delete(`/tables/${id}`);
};

/**
 * Get table status summary (counts by status for the floor-plan overview cards)
 */
export const getTableSummary = () => {
    return apiClient.get("/tables/summary");
};

/**
 * Get table QR code image (PNG). Requires auth, so fetched as a blob
 * rather than used directly as an <img src>.
 */
export const getTableQrCode = (id) => {
    return apiClient.get(`/tables/${id}/qr-code`, { responseType: "blob" });
};

/**
 * Scan a table's QR code (public — called by the customer app right after
 * scanning). Validates the table and reports whether ordering can proceed.
 */
export const scanTable = (id) => {
    return apiClient.get(`/tables/scan/${id}`);
};
