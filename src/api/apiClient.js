import axios from "axios";
import { environment } from "../environments/environment.dev.jsx"

const apiClient = axios.create({
    baseURL: environment.BASE_URL,
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
        if (error.response?.status === 401) {
            localStorage.removeItem("access_token");

            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default apiClient;