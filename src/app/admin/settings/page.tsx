"use client";

import { Languages, ShieldCheck } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAdminLocale } from "@/providers/admin-locale-provider";

const copy = {
  en: {
    eyebrow: "Golden Drip management",
    title: "Settings",
    description: "Control dashboard preferences and workspace behavior.",
    language: "Language",
    languageText: "Choose the display language for the admin dashboard.",
    english: "English",
    arabic: "Arabic",
    workspace: "Workspace",
    workspaceText: "Admin access and demo data are ready.",
  },
  ar: {
    eyebrow: "إدارة جولدن دريب",
    title: "الإعدادات",
    description: "تحكم في تفضيلات لوحة الإدارة وطريقة عملها.",
    language: "اللغة",
    languageText: "اختر لغة عرض لوحة الإدارة.",
    english: "English",
    arabic: "العربية",
    workspace: "مساحة العمل",
    workspaceText: "صلاحيات الأدمن وبيانات التجربة جاهزة.",
  },
} as const;

export default function SettingsPage() {
  const { locale, setLocale } = useAdminLocale();
  const text = copy[locale];

  return (
    <AdminShell>
      <section className="animate-content-enter mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-md border bg-card shadow-sm">
          <div className="relative p-6 sm:p-7">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-primary to-accent" />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {text.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{text.title}</h1>
            <p className="mt-2 max-w-xl leading-7 text-muted-foreground">{text.description}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <SettingsCard
            icon={Languages}
            title={text.language}
            description={text.languageText}
            action={
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
            }
          />
          <SettingsCard
            icon={ShieldCheck}
            title={text.workspace}
            description={text.workspaceText}
            action={<span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-400">Active</span>}
          />
        </div>
      </section>
    </AdminShell>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <Card className="rounded-md">
      <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
