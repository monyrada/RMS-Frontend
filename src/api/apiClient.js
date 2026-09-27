import axios from "axios";
import { environment } from "../environments/environment.dev.jsx"

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || environment.BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only force a login redirect when the failed request was actually
        // authenticated (i.e. an admin session expired/was revoked). Customer
        // QR-ordering calls never attach a token, so a 401 there is just a
        // permissions gap to let the caller's own .catch handle — not a
        // reason to yank an anonymous diner back to the login screen.
        const wasAuthenticated = Boolean(error.config?.headers?.Authorization);

        if (error.response?.status === 401 && wasAuthenticated) {
            localStorage.removeItem("access_token");

            if (!window.location.pathname.startsWith("/admin/login")) {
                window.location.href = "/admin/login";
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;