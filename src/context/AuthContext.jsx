import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// Fake credentials — swap with real API call
const ADMIN_USERS = [
  { id: 1, name: "Admin", email: "admin@rms.com", password: "admin123", role: "admin", avatar: "A" },
  { id: 2, name: "Manager", email: "manager@rms.com", password: "manager123", role: "manager", avatar: "M" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("rms_user")) || null; }
    catch { return null; }
  });

  const login = (email, password) => {
    const found = ADMIN_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      const { password: _, ...safe } = found;
      setUser(safe);
      sessionStorage.setItem("rms_user", JSON.stringify(safe));
      return { ok: true, user: safe };
    }
    return { ok: false, error: "Invalid email or password." };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("rms_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
