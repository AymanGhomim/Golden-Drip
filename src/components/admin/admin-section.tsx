"use client";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminLocale } from "@/providers/admin-locale-provider";

export function AdminSection({ title, description, count, label }: { title: [string, string]; description: [string, string]; count: number; label: [string, string] }) {
  const { locale } = useAdminLocale(); const i = locale === "en" ? 0 : 1;
  return <AdminShell><section className="animate-content-enter mx-auto w-full max-w-7xl px-4 py-8 sm:px-6"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">{locale === "en" ? "Golden Drip management" : "إدارة جولدن دريب"}</p><h1 className="mt-2 text-3xl font-bold">{title[i]}</h1><p className="mt-2 text-muted-foreground">{description[i]}</p><Card className="mt-8 max-w-sm"><CardContent className="p-6"><p className="text-sm text-muted-foreground">{label[i]}</p><p className="mt-2 text-4xl font-bold">{count}</p></CardContent></Card></section></AdminShell>;
}
