import apiClient from "../apiClient.js";

/**
 * GET /api/roles
 * Supports offset/max pagination, sort/order, name search,
 * and enabled filter — mirrors getUsers() in user/user.api.js
 */
export const getRoles = (params) => apiClient.get("/roles", { params });

/**
 *  GET /api/roles/:id
 */
export const getRoleById = (id) => apiClient.get(`/roles/${id}`);

/**
 * POST /api/roles
 * */
export const createRole = (data) => apiClient.post("/roles", data);

/** PUT /api/roles/:id */
export const updateRole = (id, data) => apiClient.put(`/roles/${id}`, data);

/** PATCH /api/roles/:id/status  { enabled: true | false } */
export const updateRoleStatus = (id, enabled) =>
    apiClient.patch(`/roles/${id}/status`, { enabled });

/** DELETE /api/roles/:id */
export const deleteRole = (id) => apiClient.delete(`/roles/${id}`);