import { createContext, useContext, useState } from "react";
import * as authApi from "../api/Auth.api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("rms_user")) || null;
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    try {
      const { data: body } = await authApi.login(email, password);
      const { accessToken, refreshToken, user: apiUser } = body.data;

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      setUser(apiUser);
      sessionStorage.setItem("rms_user", JSON.stringify(apiUser));

      return { ok: true, user: apiUser };
    } catch (err) {
      const message =
          err.response?.data?.message ||
          (err.response?.status === 401
              ? "Invalid email or password."
              : "Something went wrong. Please try again.");
      return { ok: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout — clear local state regardless
    }
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("rms_user");
  };

  return (
      <AuthContext.Provider value={{ user, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);