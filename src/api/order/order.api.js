import apiClient from "../apiClient.js";

/**
 * GET /api/v1/orders
 * Supports offset/max pagination, sort/order, status filter, etc.
 * — mirrors getRoles() in role/role.api.js
 */
export const getOrders = (params) => apiClient.get("/orders", { params });

/**
 * GET /api/v1/orders/:id
 */
export const getOrderById = (id) => apiClient.get(`/orders/${id}`);

/**
 * POST /api/v1/orders
 * Creates a new order with its items
 */
export const createOrder = (data) => apiClient.post("/orders", data);

/**
 * PUT /api/v1/orders/:id
 */
export const updateOrder = (id, data) => apiClient.put(`/orders/${id}`, data);

/**
 * DELETE /api/v1/orders/:id
 * Cancels an order
 */
export const cancelOrder = (id) => apiClient.delete(`/orders/${id}`);

/**
 * POST /api/v1/orders/:orderId/items
 * Adds an item to an order
 */
export const addOrderItem = (orderId, data) =>
    apiClient.post(`/orders/${orderId}/items`, data);

/**
 * PUT /api/v1/orders/:orderId/items/:itemId
 * Updates an order item
 */
export const updateOrderItem = (orderId, itemId, data) =>
    apiClient.put(`/orders/${orderId}/items/${itemId}`, data);

/**
 * DELETE /api/v1/orders/:orderId/items/:itemId
 * Removes an item from an order
 */
export const removeOrderItem = (orderId, itemId) =>
    apiClient.delete(`/orders/${orderId}/items/${itemId}`);