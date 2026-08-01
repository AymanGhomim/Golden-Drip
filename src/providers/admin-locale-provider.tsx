"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AdminLocale = "en" | "ar";
const AdminLocaleContext = createContext<{ locale: AdminLocale; setLocale: (locale: AdminLocale) => void } | null>(null);

export function AdminLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<AdminLocale>("ar");
  useEffect(() => { if (window.localStorage.getItem("golden-drip-admin-locale") === "ar") setLocale("ar"); }, []);
  useEffect(() => { window.localStorage.setItem("golden-drip-admin-locale", locale); }, [locale]);
  return <AdminLocaleContext.Provider value={{ locale, setLocale }}>{children}</AdminLocaleContext.Provider>;
}

export function useAdminLocale() {
  const context = useContext(AdminLocaleContext);
  if (!context) throw new Error("useAdminLocale must be used within AdminLocaleProvider");
  return context;
}
