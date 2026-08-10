"use client";

import { createContext, useContext } from "react";

export type AdminLocale = "en" | "ar";
const AdminLocaleContext = createContext<{ locale: AdminLocale } | null>(null);

export function AdminLocaleProvider({ children }: { children: React.ReactNode }) {
  return <AdminLocaleContext.Provider value={{ locale: "ar" }}>{children}</AdminLocaleContext.Provider>;
}

export function useAdminLocale() {
  const context = useContext(AdminLocaleContext);
  if (!context) throw new Error("useAdminLocale must be used within AdminLocaleProvider");
  return context;
}
