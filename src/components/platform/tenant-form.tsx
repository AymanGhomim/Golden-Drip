"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getEffectiveFeatures,
  getPlanByCode,
  getPlans,
  normalizePlanCode,
} from "@/config/plans.config";
import { tenantService } from "@/services/tenant.service";
import type {
  Tenant,
  TenantBranding,
  TenantStatus,
} from "@/types/tenant.types";
import {
  normalizeTenantBranding,
  SAFE_TENANT_BRANDING,
} from "@/lib/tenant-branding";
import { BrandAssetUpload } from "@/components/platform/brand-asset-upload";

type Draft = {
  name: string;
  slug: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  logo: string;
  branding: TenantBranding;
  plan: string;
  subscriptionType: "TRIAL" | "PAID";
  startsAt: string;
  endsAt: string;
  status: TenantStatus;
};
const colors = [
  "primary",
  "secondary",
  "accent",
  "background",
  "surface",
  "sidebar",
  "sidebarText",
  "textPrimary",
  "textSecondary",
  "border",
] as const;
const labels: Record<(typeof colors)[number], string> = {
  primary: "الأساسي",
  secondary: "الثانوي",
  accent: "الإبراز",
  background: "الخلفية",
  surface: "البطاقات",
  sidebar: "الخلفية الجانبية",
  sidebarText: "نص السايدبار",
  textPrimary: "النص الأساسي",
  textSecondary: "النص الثانوي",
  border: "الحدود",
};
const baseBranding: TenantBranding = {
  ...SAFE_TENANT_BRANDING,
  login: {
    backgroundColor: SAFE_TENANT_BRANDING.background,
    welcomeTitle: "مرحبًا بك",
    subtitle: "سجّل الدخول لإدارة كافيهك",
    cardStyle: "solid",
  },
  receipt: { showQr: true },
  qr: {
    foregroundColor: SAFE_TENANT_BRANDING.primary,
    title: "افتح المنيو",
    helperText: "امسح الكود للطلب",
  },
};
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function TenantForm({ tenant }: { tenant?: Tenant }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => ({
    name: tenant?.name || "",
    slug: tenant?.slug || "",
    phone: tenant?.contact?.phone || "",
    whatsapp: tenant?.contact?.whatsapp || "",
    email: tenant?.contact?.email || "",
    address: tenant?.contact?.address || "",
    ownerName: tenant?.owner?.name || "",
    ownerEmail: tenant?.owner?.email || "",
    ownerPhone: tenant?.owner?.phone || "",
    logo: tenant?.branding.logo || baseBranding.logo,
    branding: { ...baseBranding, ...tenant?.branding },
    plan: normalizePlanCode(
      tenant?.plan ?? getPlans().find((plan) => plan.active)?.code ?? "BASIC",
    ),
    subscriptionType: tenant?.subscription?.type || "TRIAL",
    startsAt:
      tenant?.subscription?.startsAt?.slice(0, 10) ||
      new Date().toISOString().slice(0, 10),
    endsAt:
      tenant?.subscription?.endsAt?.slice(0, 10) ||
      new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    status: tenant?.status || "TRIAL",
  }));
  useEffect(() => {
    if (!draft.slug && draft.name)
      setDraft((current) => ({ ...current, slug: slugify(current.name) }));
  }, [draft.name, draft.slug]);
  const duplicate = useMemo(
    () =>
      tenantService
        .listTenants()
        .some((item) => item.slug === draft.slug && item.id !== tenant?.id),
    [draft.slug, tenant?.id],
  );
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const updateBranding = (key: keyof TenantBranding, value: string) =>
    setDraft((current) => ({
      ...current,
      branding: { ...current.branding, [key]: value },
    }));
  const save = () => {
    if (!draft.name.trim() || !/^[a-z0-9-]+$/.test(draft.slug) || duplicate) {
      toast.error("راجع اسم الكافيه والـ المعرّف المختصر قبل الحفظ");
      return;
    }
    const plan = getPlanByCode(draft.plan);
    const tenantPayload: Tenant = {
      id: tenant?.id || `tenant-${draft.slug}-${Date.now()}`,
      slug: draft.slug,
      name: draft.name.trim(),
      status: draft.status,
      plan: draft.plan,
      subscriptionStatus:
        draft.status === "SUSPENDED"
          ? "CANCELED"
          : draft.subscriptionType === "TRIAL"
            ? "TRIALING"
            : "ACTIVE",
      branding: normalizeTenantBranding({
        ...draft.branding,
        logo: draft.logo || draft.branding.logo,
      }),
      settings: {
        currency: "EGP",
        currencySymbol: "ج.م",
        timezone: "Africa/Cairo",
        locale: "ar",
        taxRate: 14,
      },
      features: getEffectiveFeatures(plan.code),
      featureOverrides: {},
      createdAt: tenant?.createdAt || new Date().toISOString(),
      contact: {
        phone: draft.phone,
        whatsapp: draft.whatsapp,
        email: draft.email,
        address: draft.address,
      },
      owner: {
        name: draft.ownerName,
        email: draft.ownerEmail,
        phone: draft.ownerPhone,
      },
      subscription: {
        type: draft.subscriptionType,
        startsAt: draft.startsAt,
        endsAt: draft.endsAt,
      },
    };
    tenant
      ? tenantService.updateTenant(tenant.id, tenantPayload)
      : tenantService.createTenant(tenantPayload);
    setSubmitted(true);
    toast.success(tenant ? "تم تحديث بيانات الكافيه" : "تم إنشاء الكافيه");
    router.replace(`/platform/tenants/${tenantPayload.id}`);
  };
  const steps = [
    "بيانات الكافيه",
    "حساب المسؤول",
    "الهوية",
    "الباقة",
    "الاشتراك",
    "المراجعة",
  ];
  return (
    <section className="mx-auto max-w-[1500px] p-5 sm:p-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#374151]">إدارة الكافيهات</p>
          <h1 className="mt-2 text-3xl font-black">
            {tenant ? "تعديل الكافيه" : "إضافة كافيه"}
          </h1>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          إلغاء
        </Button>
      </div>
      <div className="mb-6 grid gap-2 sm:grid-cols-6">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(index)}
            className={`rounded-xl border px-3 py-3 text-xs font-bold ${step === index ? "border-[#111111] bg-[#111111] text-white" : "border-[#D1D5DB] bg-white text-[#374151]"}`}
          >
            <span className="mb-1 block text-[10px] opacity-70">
              {index + 1}
            </span>
            {label}
          </button>
        ))}
      </div>
      <Card>
        <CardContent className="p-5 sm:p-8">
          {step === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="اسم الكافيه"
                value={draft.name}
                onChange={(value) => {
                  update("name", value);
                  if (!tenant) update("slug", slugify(value));
                }}
              />
              <Field
                label="المعرّف المختصر"
                value={draft.slug}
                onChange={(value) => update("slug", slugify(value))}
                error={
                  duplicate
                    ? "هذا الـ المعرّف المختصر مستخدم بالفعل"
                    : undefined
                }
              />
              <Field
                label="الهاتف"
                value={draft.phone}
                onChange={(value) => update("phone", value)}
              />
              <Field
                label="WhatsApp"
                value={draft.whatsapp}
                onChange={(value) => update("whatsapp", value)}
              />
              <Field
                label="البريد الإلكتروني"
                value={draft.email}
                onChange={(value) => update("email", value)}
              />
              <Field
                label="العنوان"
                value={draft.address}
                onChange={(value) => update("address", value)}
              />
            </div>
          ) : null}
          {step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="اسم المسؤول"
                value={draft.ownerName}
                onChange={(value) => update("ownerName", value)}
              />
              <Field
                label="البريد الإلكتروني"
                value={draft.ownerEmail}
                onChange={(value) => update("ownerEmail", value)}
              />
              <Field
                label="الهاتف"
                value={draft.ownerPhone}
                onChange={(value) => update("ownerPhone", value)}
              />
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                حساب المسؤول هنا عقد Frontend فقط. كلمة المرور والدخول الآمن
                يحتاجان Backend.
              </div>
            </div>
          ) : null}
          {step === 2 ? (
            <div>
              <BrandAssetUpload
                label="الشعار الرئيسي"
                kind="logo"
                value={draft.logo}
                onChange={(value) => update("logo", value || "")}
                className="mb-5 max-w-xl"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {colors.map((key) => (
                  <label key={key} className="text-sm font-bold">
                    {labels[key]}
                    <div className="mt-2 flex gap-2">
                      <input
                        type="color"
                        value={draft.branding[key] as string}
                        onChange={(event) =>
                          updateBranding(key, event.target.value)
                        }
                        className="h-10 w-12 rounded-lg border p-1"
                      />
                      <Input
                        value={draft.branding[key] as string}
                        onChange={(event) =>
                          updateBranding(key, event.target.value)
                        }
                        pattern="^#[0-9A-Fa-f]{6}$"
                      />
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field
                  label="الخط"
                  value={draft.branding.fontFamily || "Cairo"}
                  onChange={(value) => updateBranding("fontFamily", value)}
                />
                <Field
                  label="نصف قطر الحواف"
                  value={draft.branding.radius}
                  onChange={(value) => updateBranding("radius", value)}
                />
              </div>
            </div>
          ) : null}
          {step === 3 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {getPlans()
                .filter((item) => item.active)
                .map((availablePlan) => {
                  const code = availablePlan.code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => update("plan", code)}
                      className={`rounded-2xl border p-5 text-right ${draft.plan === code ? "border-[#111111] bg-[#F3F4F6] ring-2 ring-[#111111]/20" : "bg-white"}`}
                    >
                      <p className="font-black">{code}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {getPlanByCode(code).description}
                      </p>
                      <p className="mt-4 text-xs font-bold text-[#374151]">
                        {getPlanByCode(code).features.length} ميزة
                      </p>
                    </button>
                  );
                })}
            </div>
          ) : null}
          {step === 4 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold">
                نوع الاشتراك
                <select
                  value={draft.subscriptionType}
                  onChange={(event) =>
                    update(
                      "subscriptionType",
                      event.target.value as Draft["subscriptionType"],
                    )
                  }
                  className="mt-2 h-10 w-full rounded-lg border bg-background px-3"
                >
                  <option value="TRIAL">تجريبي</option>
                  <option value="PAID">مدفوع</option>
                </select>
              </label>
              <label className="text-sm font-bold">
                الحالة
                <select
                  value={draft.status}
                  onChange={(event) =>
                    update("status", event.target.value as TenantStatus)
                  }
                  className="mt-2 h-10 w-full rounded-lg border bg-background px-3"
                >
                  <option value="TRIAL">تجريبي</option>
                  <option value="ACTIVE">نشط</option>
                  <option value="SUSPENDED">موقوف</option>
                  <option value="ARCHIVED">منتهي</option>
                </select>
              </label>
              <Field
                label="تاريخ البداية"
                value={draft.startsAt}
                onChange={(value) => update("startsAt", value)}
                type="date"
              />
              <Field
                label="تاريخ الانتهاء"
                value={draft.endsAt}
                onChange={(value) => update("endsAt", value)}
                type="date"
              />
            </div>
          ) : null}
          {step === 5 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-3 rounded-2xl bg-[#F3F4F6] p-5">
                <h2 className="font-black">ملخص الكافيه</h2>
                <Summary label="الاسم" value={draft.name || "—"} />
                <Summary label="المعرّف المختصر" value={draft.slug || "—"} />
                <Summary label="المسؤول" value={draft.ownerName || "—"} />
                <Summary label="الباقة" value={draft.plan} />
                <Summary
                  label="الاشتراك"
                  value={
                    draft.subscriptionType === "TRIAL" ? "تجريبي" : "مدفوع"
                  }
                />
              </div>
              <div
                className="rounded-2xl p-6 text-white"
                style={{ backgroundColor: draft.branding.primary }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/20 p-2">
                    <img
                      src={draft.logo || draft.branding.logo}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs opacity-75">معاينة الهوية</p>
                    <h2 className="font-black">
                      {draft.name || "اسم الكافيه"}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-8 rounded-lg bg-white px-4 py-2 text-sm font-bold"
                  style={{ color: draft.branding.primary }}
                >
                  زر أساسي
                </button>
              </div>
            </div>
          ) : null}
          <div className="mt-8 flex items-center justify-between border-t pt-5">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((value) => value - 1)}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              السابق
            </Button>
            {step < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() => setStep((value) => value + 1)}
              >
                التالي
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={save} disabled={submitted}>
                <Save className="ml-2 h-4 w-4" />
                {tenant ? "حفظ التعديلات" : "إنشاء الكافيه"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
}) {
  return (
    <label className="text-sm font-bold">
      {label}
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2"
      />
      {error ? (
        <span className="mt-1 block text-xs font-normal text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}
function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] pb-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
