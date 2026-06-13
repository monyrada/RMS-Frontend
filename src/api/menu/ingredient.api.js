import apiClient from "../apiClient.js";

/**
 * Get Ingredients
 */
export const getIngredients = (params = {}) => {
    return apiClient.get("/ingredients", { params });
};

/**
 * Get Ingredient By ID
 */
export const getIngredientById = (id) => {
    return apiClient.get(`/ingredients/${id}`);
};

/**
 * Create Ingredient
 */
export const createIngredient = (payload) => {
    return apiClient.post("/ingredients", payload);
};

/**
 * Update Ingredient
 */
export const updateIngredient = (id, payload) => {
    return apiClient.put(`/ingredients/${id}`, payload);
};

/**
 * Delete Ingredient
 */
export const deleteIngredient = (id) => {
    return apiClient.delete(`/ingredients/${id}`);
};