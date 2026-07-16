import apiClient from "../apiClient.js";

/**
 * GET /api/users
 * Supports offset/max pagination, sort/order, keyword search,
 * status & gender filters — mirrors getMenus() in menu/item.api.js
 */
export const getUsers = (params) => apiClient.get("/users", { params });

/**
 *  GET /api/users/:id
 */
export const getUserById = (id) => apiClient.get(`/users/${id}`);

/**
 * POST /api/users
 * */
export const createUser = (data) => apiClient.post("/users", data);

/** PUT /api/users/:id */
export const updateUser = (id, data) => apiClient.put(`/users/${id}`, data);

/** PATCH /api/users/:id/status  { status: "ACTIVE" | "INACTIVE" } */
export const updateUserStatus = (id, status) =>
    apiClient.patch(`/users/${id}/status`, { status });

/** DELETE /api/users/:id */
export const deleteUser = (id) => apiClient.delete(`/users/${id}`);