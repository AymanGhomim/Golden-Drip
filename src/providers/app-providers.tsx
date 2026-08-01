"use client";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "next-themes";
import { AdminLocaleProvider } from "./admin-locale-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AdminLocaleProvider><QueryProvider>{children}</QueryProvider></AdminLocaleProvider>
    </ThemeProvider>
  );
}
