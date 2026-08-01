"use client";

import { Languages } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAdminLocale } from "@/providers/admin-locale-provider";

const copy = {
  en: {
    title: "Settings",
    description: "Control dashboard preferences.",
    language: "Language",
    languageText: "Choose the display language for the admin dashboard.",
    english: "English",
    arabic: "Arabic",
  },
  ar: {
    title: "الإعدادات",
    description: "تحكم في تفضيلات لوحة الإدارة.",
    language: "اللغة",
    languageText: "اختر لغة عرض لوحة الإدارة.",
    english: "English",
    arabic: "العربية",
  },
} as const;

export default function SettingsPage() {
  const { locale, setLocale } = useAdminLocale();
  const text = copy[locale];

  return (
    <AdminShell>
      <section className="animate-content-enter mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Golden Drip management
        </p>
        <h1 className="mt-2 text-3xl font-bold">{text.title}</h1>
        <p className="mt-2 text-muted-foreground">{text.description}</p>

        <Card className="mt-8 rounded-md">
          <CardContent className="p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <Languages className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">{text.language}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {text.languageText}
                  </p>
                </div>
              </div>
              <div className="grid w-full grid-cols-2 gap-2 sm:w-64" dir="ltr">
                <button
                  type="button"
                  className={cn(
                    "rounded-md border px-4 py-2.5 text-sm font-bold transition-colors",
                    locale === "en"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "bg-card hover:bg-muted"
                  )}
                  onClick={() => setLocale("en")}
                >
                  {text.english}
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-md border px-4 py-2.5 text-sm font-bold transition-colors",
                    locale === "ar"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "bg-card hover:bg-muted"
                  )}
                  onClick={() => setLocale("ar")}
                >
                  {text.arabic}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
