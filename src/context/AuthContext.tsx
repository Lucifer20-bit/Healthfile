"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { UserSession, UserRole } from "@/types";

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  demoLogin: (role: UserRole, specificEmail?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ACCOUNTS = {
  patient: {
    name: "Alex Morgan",
    email: "alex.morgan@healthfile.com",
    role: "PATIENT" as UserRole,
    desc: "Active Patient (Type 2 Diabetes, HTN)",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    password: "patient123",
  },
  doctor: {
    name: "Dr. Sarah Mitchell, MD",
    email: "dr.sarah@healthfile.com",
    role: "DOCTOR" as UserRole,
    desc: "Cardiologist & Preventive Care",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    password: "doctor123",
  },
  doctor2: {
    name: "Dr. Elena Rostova, MD",
    email: "dr.elena@healthfile.com",
    role: "DOCTOR" as UserRole,
    desc: "Endocrinology & Metabolic Disorders",
    avatar: "https://images.unsplash.com/photo-1594824813637-4560731a5eb2?w=150&auto=format&fit=crop&q=80",
    password: "doctor123",
  },
  admin: {
    name: "Arthur Pendelton",
    email: "admin@healthfile.com",
    role: "ADMIN" as UserRole,
    desc: "Hospital System Administrator",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    password: "admin123",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password = "password123"): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: UserRole, specificEmail?: string): Promise<boolean> => {
    let target = DEMO_ACCOUNTS.patient;
    if (specificEmail) {
      const found = Object.values(DEMO_ACCOUNTS).find((a) => a.email === specificEmail);
      if (found) target = found;
    } else if (role === "DOCTOR") {
      target = DEMO_ACCOUNTS.doctor;
    } else if (role === "ADMIN") {
      target = DEMO_ACCOUNTS.admin;
    }

    const success = await login(target.email, target.password);
    if (success) {
      if (target.role === "PATIENT") router.push("/dashboard/patient");
      else if (target.role === "DOCTOR") router.push("/dashboard/doctor");
      else if (target.role === "ADMIN") router.push("/dashboard/admin");
    }
    return success;
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        demoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
