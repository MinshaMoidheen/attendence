"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { selectUser, selectIsAuthenticated, logout as reduxLogout } from "@/store/authentication";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, keepLoggedIn?: boolean) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();
  
  // Try to get Redux state first, fallback to local state
  const reduxUser = useSelector(selectUser);
  const reduxIsAuthenticated = useSelector(selectIsAuthenticated);
  
  const [user, setUser] = useState<User | null>(reduxUser);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with Redux state
  useEffect(() => {
    if (reduxUser) {
      setUser(reduxUser);
    }
  }, [reduxUser]);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const savedUser = localStorage.getItem("user");
      const authToken = localStorage.getItem("authToken");
      
      if (savedUser && authToken) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, keepLoggedIn: boolean = false): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call - replace with actual authentication logic
      // For demo purposes, accept any email/password combination
      if (email && password) {
        const userData: User = {
          id: "1",
          email: email,
          name: email.split("@")[0], // Use email prefix as name
        };

        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("authToken", "demo-token-" + Date.now());
        
        if (keepLoggedIn) {
          localStorage.setItem("keepLoggedIn", "true");
        }

        setUser(userData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      // Use Redux logout if available, otherwise fallback to local logout
      if (reduxIsAuthenticated) {
        dispatch(reduxLogout());
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        localStorage.removeItem("keepLoggedIn");
        setUser(null);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value: AuthContextType = {
    user: reduxUser || user,
    isAuthenticated: reduxIsAuthenticated || !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
