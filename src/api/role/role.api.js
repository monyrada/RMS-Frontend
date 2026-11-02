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

/** GET /api/v1/permissions — every permission that can be granted to a role */
export const getPermissions = () => apiClient.get("/permissions");

/** PUT /api/v1/roles/:id/permissions  { permissions: ["ORDER_VIEW", ...] } — replaces the role's set */
export const updateRolePermissions = (id, permissions) =>
    apiClient.put(`/roles/${id}/permissions`, { permissions });

/** DELETE /api/roles/:id */
export const deleteRole = (id) => apiClient.delete(`/roles/${id}`);