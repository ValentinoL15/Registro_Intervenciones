"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { User, UserRole } from "./types";
import { authAPI } from "@/service/api"

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>; // Cambiar a Promise<void>
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");

      if (token && userId) {
        try {
          const userData = await authAPI.getUser(Number(userId));
          setUser(userData);
        } catch (err) {
          console.error("Error validando sesión:", err);
          localStorage.clear();
        }
      }
      setIsLoading(false);
    }

    checkAuth();
  }, []); // Dependencias vacías - solo se ejecuta una vez al montar

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await authAPI.login(username, password);
      console.log("Login exitoso:", { username, userId: response.userId });
      
      if (response.access_token) {
        localStorage.setItem("authToken", response.access_token);
        if (response.userId) {
          localStorage.setItem("userId", response.userId.toString());
        }
        if (response.username) {
          localStorage.setItem("username", response.username);
        }
        if (response.userRole) {
          localStorage.setItem("userRole", response.userRole);
        }
        
        setUser({
          userId: response.userId || 0,
          username: response.username,
          email: response.email || "",
          role: response.userRole as UserRole,
          name: response.name,
          lastname: response.lastname
        });
        
      }
    } catch (err: any) {
      const errorMessage = err.userMessage || (err instanceof Error ? err.message : "Error al iniciar sesión");
      console.error("Login fallido:", { error: errorMessage, details: err });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.clear(); // Cambiado de sessionStorage a localStorage
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}