"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
  github_username?: string | null;
  is_email_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readInitialAuthState() {
  if (typeof window === "undefined") {
    return {
      user: null as User | null,
      token: null as string | null,
      isLoading: true,
    };
  }

  const storedToken = localStorage.getItem("auth_token");
  const storedUser = localStorage.getItem("auth_user");

  if (storedToken && storedUser) {
    try {
      return {
        token: storedToken,
        user: JSON.parse(storedUser) as User,
        isLoading: false,
      };
    } catch (error) {
      console.error("Failed to parse stored user", error);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
  }

  return {
    user: null as User | null,
    token: null as string | null,
    isLoading: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialState] = useState(readInitialAuthState);
  const [user, setUser] = useState<User | null>(initialState.user);
  const [token, setToken] = useState<string | null>(initialState.token);
  const [isLoading] = useState(initialState.isLoading);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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
