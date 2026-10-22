/**
 * LifeLink - Authentication & Authorization Context
 * 
 * Student Developer: Arsh Vardhan Singh (Reg. No: 24BCE2119)
 * Institutional Context: VIT, School of Computer Science and Engineering
 * Course Context: Database Systems Lab
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api.ts";

export type RoleId = "ADMIN" | "HOSPITAL_STAFF" | "DOCTOR" | "DONOR_COORDINATOR";

export interface User {
  userId: string;
  email: string;
  fullName: string;
  roleId: RoleId;
  hospitalId: string | null;
  hospitalName?: string | null;
  hasActiveEmergency?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loginAsRole: (roleId: RoleId) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const DEFAULT_USER: User = {
  userId: "usr-admin-01",
  email: "admin@lifelink.org",
  fullName: "Arsh Vardhan Singh (Admin)",
  roleId: "ADMIN",
  hospitalId: null,
  hospitalName: "Global Network Coordinator",
  hasActiveEmergency: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const [token, setToken] = useState<string | null>(localStorage.getItem("lifelink_token") || "demo-token-admin");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res && res.user) {
        setUser(res.user);
      }
    } catch (e) {
      // fallback to current user
    }
  };

  const loginAsRole = async (roleId: RoleId) => {
    setIsLoading(true);
    try {
      const res = await api.loginAsRole(roleId);
      if (res && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem("lifelink_token", res.token);
      }
    } catch (e) {
      console.warn("API login failed, falling back to local simulation:", e);
      // Local fallback simulation
      const fallbackUsers: Record<RoleId, User> = {
        ADMIN: {
          userId: "usr-admin-01",
          email: "admin@lifelink.org",
          fullName: "Arsh Vardhan Singh (Admin)",
          roleId: "ADMIN",
          hospitalId: null,
          hospitalName: "Global Network Coordinator",
          hasActiveEmergency: false,
        },
        HOSPITAL_STAFF: {
          userId: "usr-staff-cmc",
          email: "staff.cmc@lifelink.org",
          fullName: "Kavita Raman (Staff)",
          roleId: "HOSPITAL_STAFF",
          hospitalId: "hosp-cmc-vellore",
          hospitalName: "Christian Medical College (CMC)",
          hasActiveEmergency: false,
        },
        DOCTOR: {
          userId: "usr-doctor-cmc",
          email: "dr.sharma@lifelink.org",
          fullName: "Dr. Vikram Sharma, MD",
          roleId: "DOCTOR",
          hospitalId: "hosp-cmc-vellore",
          hospitalName: "Christian Medical College (CMC)",
          hasActiveEmergency: false,
        },
        DONOR_COORDINATOR: {
          userId: "usr-coord-cmc",
          email: "coordinator@lifelink.org",
          fullName: "Ananya Sundaram",
          roleId: "DONOR_COORDINATOR",
          hospitalId: "hosp-cmc-vellore",
          hospitalName: "Christian Medical College (CMC)",
          hasActiveEmergency: false,
        },
      };
      setUser(fallbackUsers[roleId]);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("lifelink_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, loginAsRole, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
