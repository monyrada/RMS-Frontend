import apiClient from "../apiClient.js";

/**
 * Get Categories
 */
export const getCategories = (params = {}) => {
    return apiClient.get("/categories", { params });
};

/**
 * Get Category By ID
 */
export const getCategoryById = (id) => {
    return apiClient.get(`/categories/${id}`);
};

/**
 * Create Category
 */
export const createCategory = (payload) => {
    return apiClient.post("/categories", payload);
};

/**
 * Update Category
 */
export const updateCategory = (id, payload) => {
    return apiClient.put(`/categories/${id}`, payload);
};

/**
 * Delete Category
 */
export const deleteCategory = (id) => {
    return apiClient.delete(`/categories/${id}`);
};