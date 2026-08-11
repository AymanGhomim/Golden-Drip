"use client";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "next-themes";
import { AdminLocaleProvider } from "./admin-locale-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AdminLocaleProvider>
        <TooltipProvider delayDuration={250}><QueryProvider>{children}</QueryProvider></TooltipProvider>
      </AdminLocaleProvider>
    </ThemeProvider>
  );
}
