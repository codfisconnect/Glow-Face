import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("glow_user");
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("glow_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      authService.getProfile()
        .then(profile => {
          setUser(profile);
          localStorage.setItem("glow_user", JSON.stringify(profile));
        })
        .catch(() => {
          // Token expired or invalid
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await authService.login(credentials);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem("glow_token", res.token);
    localStorage.setItem("glow_user", JSON.stringify(res.user));
    return res.user;
  };

  const register = async (data: { email: string; password: string; name: string; phone?: string }) => {
    const res = await authService.register(data);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem("glow_token", res.token);
    localStorage.setItem("glow_user", JSON.stringify(res.user));
    return res.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("glow_token");
    localStorage.removeItem("glow_user");
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};