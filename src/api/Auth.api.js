import apiClient from "./apiClient.js";

/**
 * POST /api/v1/auth/login
 * body: { email, password }
 * expected response: { accessToken, refreshToken, user: {...} }
 */
export const login = (email, password) =>
    apiClient.post("/auth/login", { email, password });

/**
 * POST /api/v1/auth/refresh
 * body: { refreshToken }
 * expected response: { accessToken, refreshToken }
 */
export const refreshToken = (refreshToken) =>
    apiClient.post("/auth/refresh", { refreshToken });

/**
 * POST /api/v1/auth/logout
 */
export const logout = () => apiClient.post("/auth/logout");

/**
 * POST /api/v1/auth/logout-all
 */
export const logoutAll = () => apiClient.post("/auth/logout-all");

/**
 * GET /api/v1/auth/sessions
 */
export const getSessions = () => apiClient.get("/auth/sessions");