"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ClientType } from "@/types/tenant.types";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "kitchen" | "platform_super_admin";
  tenantId?: string;
  employeeId?: string;
  clientType?: ClientType;
};

interface AuthState { user: AuthUser | null; isAuthenticated: boolean; login: (user: AuthUser) => void; logout: () => void; }

export const useAuthStore = create<AuthState>()(persist((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}), { name: "auth-storage", storage: createJSONStorage(() => localStorage), skipHydration: true }));
