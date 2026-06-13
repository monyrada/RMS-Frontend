import apiClient from "../apiClient.js";

/**
 * Get All Menus
 */
export const getMenus = (params = {}) => {
    return apiClient.get("/items", { params });
};

/**
 * Get Menu By ID
 */
export const getMenuById = (id) => {
    return apiClient.get(`/items/${id}`);
};

/**
 * Create Menu
 */
export const createMenu = (payload) => {
    return apiClient.post("/items", payload);
};

/**
 * Update Menu
 */
export const updateMenu = (id, payload) => {
    return apiClient.put(`/items/${id}`, payload);
};

/**
 * Delete Menu
 */
export const deleteMenu = (id) => {
    return apiClient.delete(`/items/${id}`);
};