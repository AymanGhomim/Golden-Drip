"use client";

import { useEffect, useState } from "react";
import { Percent, ShieldCheck } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminLocale } from "@/providers/admin-locale-provider";
import { useSettingsStore } from "@/store/settings.store";
import { useTenant } from "@/providers/tenant-provider";
import { useCurrentEmployee } from "@/providers/current-employee-provider";

const copy = {
  en: {
    eyebrow: "Cafe management",
    title: "Settings",
    description: "Control dashboard preferences and workspace behavior.",
    serviceTax: "Service tax",
    serviceTaxText: "Set the service percentage added to customer cart totals.",
    serviceTaxLabel: "Service percentage",
    serviceTaxHint: "Applied automatically in cart totals.",
    language: "Language",
    languageText: "Choose the display language for the admin dashboard.",
    english: "English",
    arabic: "Arabic",
    workspace: "Workspace",
    workspaceText: "Admin access and demo data are ready.",
    active: "Active",
  },
  ar: {
    eyebrow: "إدارة الكافيه",
    title: "الإعدادات",
    description: "تحكم في تفضيلات لوحة الإدارة وطريقة عملها.",
    serviceTax: "ضريبة الخدمة",
    serviceTaxText: "حدد نسبة الخدمة المضافة على إجمالي سلة العميل.",
    serviceTaxLabel: "نسبة الخدمة",
    serviceTaxHint: "تطبق تلقائيا داخل إجمالي الكارت.",
    language: "اللغة",
    languageText: "اختر لغة عرض لوحة الإدارة.",
    english: "English",
    arabic: "العربية",
    workspace: "مساحة العمل",
    workspaceText: "صلاحيات الأدمن وبيانات التجربة جاهزة.",
    active: "نشط",
  },
} as const;

export default function SettingsPage() {
  const { locale } = useAdminLocale();
  const { tenant } = useTenant();
  const { hasPermission } = useCurrentEmployee();
  const canEdit = hasPermission("settings.edit");
  const serviceTaxPercent = useSettingsStore(
    (state) => state.serviceTaxPercent,
  );
  const setServiceTaxPercent = useSettingsStore(
    (state) => state.setServiceTaxPercent,
  );
  const [taxInput, setTaxInput] = useState("0");
  const text = copy[locale];

  useEffect(() => {
    useSettingsStore.getState().loadForTenant();
  }, []);

  useEffect(() => {
    setTaxInput(String(serviceTaxPercent));
  }, [serviceTaxPercent]);

  function handleTaxChange(value: string) {
    if (!canEdit) return;
    setTaxInput(value);
    const nextValue = Number(value);

    if (!Number.isNaN(nextValue)) {
      setServiceTaxPercent(nextValue);
    }
  }

  return (
    <AdminShell>
      <section className="animate-content-enter mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-md border bg-card shadow-sm">
          <div className="relative p-6 sm:p-7">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-primary to-accent" />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {locale === "ar"
                ? `إدارة ${tenant.name}`
                : `${tenant.name} management`}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {text.title}
            </h1>
            <p className="mt-2 max-w-xl leading-7 text-muted-foreground">
              {text.description}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <SettingsCard
            icon={Percent}
            title={text.serviceTax}
            description={text.serviceTaxText}
            action={
              <div className="w-full space-y-2 sm:w-72">
                <Label
                  htmlFor="service-tax"
                  className="text-xs font-bold text-muted-foreground"
                >
                  {text.serviceTaxLabel}
                </Label>
                <div className="relative">
                  <Input
                    id="service-tax"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={taxInput}
                    disabled={!canEdit}
                    onChange={(event) => handleTaxChange(event.target.value)}
                    className="h-11 rounded-md pe-12 text-base font-black"
                  />
                  <span className="pointer-events-none absolute inset-y-0 end-4 flex items-center text-sm font-black text-muted-foreground">
                    %
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {canEdit ? text.serviceTaxHint : "لديك صلاحية عرض الإعدادات فقط."}
                </p>
              </div>
            }
          />
          <SettingsCard
            icon={ShieldCheck}
            title={text.workspace}
            description={text.workspaceText}
            action={
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-700">
                {text.active}
              </span>
            }
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
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
