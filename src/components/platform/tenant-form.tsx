"use client";

/* eslint-disable @next/next/no-img-element -- Tenant previews may use temporary data/blob URLs. */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FEATURE_GROUPS,
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
import { credentialService } from "@/services/credential.service";
import type { FeatureKey } from "@/types/platform.types";

type Draft = {
  name: string;
  slug: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  locationUrl: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerUsername: string;
  ownerPassword: string;
  ownerPasswordConfirm: string;
  logo: string;
  branding: TenantBranding;
  plan: string;
  featureSelectionMode: "PLAN" | "CUSTOM";
  enabledFeatures: FeatureKey[];
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
const featureKeys = FEATURE_GROUPS.flatMap((group) =>
  group.items.map((item) => item.key),
);
const featuresForPlan = (planCode: string) => {
  const effective = getEffectiveFeatures(planCode);
  return featureKeys.filter((key) => effective[key]);
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
  const existingOwner = tenant ? credentialService.getOwner(tenant.id) : undefined;
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => {
    const plan = normalizePlanCode(
      tenant?.plan ?? getPlans().find((item) => item.active)?.code ?? "BASIC",
    );
    const hasCustomFeatures = Boolean(
      tenant?.featureOverrides &&
        Object.keys(tenant.featureOverrides).length > 0,
    );
    const effectiveFeatures = getEffectiveFeatures(
      plan,
      hasCustomFeatures ? tenant?.featureOverrides : undefined,
    );

    return {
    name: tenant?.name || "",
    slug: tenant?.slug || "",
    phone: tenant?.contact?.phone || "",
    whatsapp: tenant?.contact?.whatsapp || "",
    email: tenant?.contact?.email || "",
    address: tenant?.contact?.address || "",
    locationUrl: tenant?.contact?.locationUrl || "",
    facebook: tenant?.contact?.facebook || "",
    instagram: tenant?.contact?.instagram || "",
    tiktok: tenant?.contact?.tiktok || "",
    ownerName: tenant?.owner?.name || "",
    ownerEmail: tenant?.owner?.email || "",
    ownerPhone: tenant?.owner?.phone || "",
    ownerUsername: existingOwner ? credentialService.getLogin(existingOwner) : "",
    ownerPassword: "",
    ownerPasswordConfirm: "",
    logo: tenant?.branding.logo || baseBranding.logo,
    branding: { ...baseBranding, ...tenant?.branding },
    plan,
    featureSelectionMode: hasCustomFeatures ? "CUSTOM" : "PLAN",
    enabledFeatures: featureKeys.filter((key) => effectiveFeatures[key]),
    subscriptionType: tenant?.subscription?.type || "TRIAL",
    startsAt:
      tenant?.subscription?.startsAt?.slice(0, 10) ||
      new Date().toISOString().slice(0, 10),
    endsAt:
      tenant?.subscription?.endsAt?.slice(0, 10) ||
      new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    status: tenant?.status || "TRIAL",
    };
  });
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
  const save = async () => {
    if (!draft.name.trim() || !/^[a-z0-9-]+$/.test(draft.slug) || duplicate) {
      toast.error("راجع اسم الكافيه والـ المعرّف المختصر قبل الحفظ");
      return;
    }
    if (!draft.ownerName.trim() || !draft.ownerUsername.trim()) {
      toast.error("اسم المسؤول واسم المستخدم مطلوبان.");
      setStep(1);
      return;
    }
    if (!tenant && draft.ownerPassword.length < 6) {
      toast.error("كلمة المرور يجب ألا تقل عن 6 أحرف.");
      setStep(1);
      return;
    }
    if (draft.ownerPassword && draft.ownerPassword.length < 6) {
      toast.error("كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف.");
      setStep(1);
      return;
    }
    if (draft.ownerPassword !== draft.ownerPasswordConfirm) {
      toast.error("كلمتا المرور غير متطابقتين.");
      setStep(1);
      return;
    }
    const plan = getPlanByCode(draft.plan);
    const featureOverrides =
      draft.featureSelectionMode === "CUSTOM"
        ? (Object.fromEntries(
            featureKeys.map((key) => [key, draft.enabledFeatures.includes(key)]),
          ) as Partial<Record<FeatureKey, boolean>>)
        : {};
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
      features: getEffectiveFeatures(plan.code, featureOverrides),
      featureOverrides,
      createdAt: tenant?.createdAt || new Date().toISOString(),
      contact: {
        phone: draft.phone,
        whatsapp: draft.whatsapp,
        email: draft.email,
        address: draft.address,
        locationUrl: draft.locationUrl,
        facebook: draft.facebook,
        instagram: draft.instagram,
        tiktok: draft.tiktok,
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
    try {
      tenant
        ? tenantService.updateTenant(tenant.id, tenantPayload)
        : tenantService.createTenant(tenantPayload);
      await credentialService.provisionOwner(tenantPayload.id, {
        name: draft.ownerName,
        email: draft.ownerEmail,
        phone: draft.ownerPhone,
        username: draft.ownerUsername,
        password: draft.ownerPassword || undefined,
      });
      setSubmitted(true);
      toast.success(
        tenant
          ? draft.ownerPassword
            ? "تم تحديث الكافيه وإعادة تعيين كلمة مرور المسؤول"
            : "تم تحديث بيانات الكافيه"
          : "تم إنشاء الكافيه وحساب المسؤول",
      );
      router.replace(`/platform/tenants/${tenantPayload.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حفظ بيانات الكافيه.");
    }
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
              <Field
                label="رابط الموقع على الخريطة"
                value={draft.locationUrl}
                onChange={(value) => update("locationUrl", value)}
              />
              <Field
                label="Facebook"
                value={draft.facebook}
                onChange={(value) => update("facebook", value)}
              />
              <Field
                label="Instagram"
                value={draft.instagram}
                onChange={(value) => update("instagram", value)}
              />
              <Field
                label="TikTok"
                value={draft.tiktok}
                onChange={(value) => update("tiktok", value)}
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
              <Field
                label="اسم المستخدم"
                value={draft.ownerUsername}
                onChange={(value) => update("ownerUsername", value)}
              />
              <Field
                label={tenant ? "كلمة مرور جديدة (اختياري)" : "كلمة المرور"}
                value={draft.ownerPassword}
                onChange={(value) => update("ownerPassword", value)}
                type="password"
              />
              <Field
                label={tenant ? "تأكيد كلمة المرور الجديدة" : "تأكيد كلمة المرور"}
                value={draft.ownerPasswordConfirm}
                onChange={(value) => update("ownerPasswordConfirm", value)}
                type="password"
              />
              <p className="sm:col-span-2 text-xs leading-6 text-muted-foreground">
                {tenant
                  ? "اترك كلمة المرور فارغة للاحتفاظ بها، أو اكتب كلمة جديدة لإعادة تعيينها مباشرة بصلاحية مالك المنصة."
                  : "سيستخدم مسؤول الكافيه اسم المستخدم وكلمة المرور لتسجيل الدخول إلى لوحة الإدارة."}
              </p>
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
            <div className="space-y-8">
              <div>
                <div className="mb-4">
                  <h2 className="font-black">الباقة</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    اختر الباقة أولًا، ثم حدد هل تريد استخدام مميزاتها أو تخصيص المميزات يدويًا.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {getPlans()
                    .filter((item) => item.active)
                    .map((availablePlan) => {
                      const code = availablePlan.code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              plan: code,
                              enabledFeatures:
                                current.featureSelectionMode === "PLAN"
                                  ? featuresForPlan(code)
                                  : current.enabledFeatures,
                            }))
                          }
                          className={`rounded-2xl border p-5 text-right ${draft.plan === code ? "border-[#111111] bg-[#F3F4F6] ring-2 ring-[#111111]/20" : "bg-white"}`}
                        >
                          <p className="font-black">{availablePlan.name}</p>
                          <p className="mt-1 text-xs font-bold text-[#667085]">
                            {code}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {availablePlan.description}
                          </p>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div>
                <h2 className="font-black">طريقة اختيار المميزات</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        featureSelectionMode: "PLAN",
                        enabledFeatures: featuresForPlan(current.plan),
                      }))
                    }
                    className={`rounded-2xl border p-5 text-right transition ${draft.featureSelectionMode === "PLAN" ? "border-[#111111] bg-[#111111] text-white ring-2 ring-[#111111]/20" : "border-[#D1D5DB] bg-white"}`}
                  >
                    <span className="block font-black">استخدام مميزات الباقة</span>
                    <span className={`mt-1 block text-xs leading-5 ${draft.featureSelectionMode === "PLAN" ? "text-white/70" : "text-muted-foreground"}`}>
                      تتغير المميزات تلقائيًا عند تغيير الباقة.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => update("featureSelectionMode", "CUSTOM")}
                    className={`rounded-2xl border p-5 text-right transition ${draft.featureSelectionMode === "CUSTOM" ? "border-[#111111] bg-[#111111] text-white ring-2 ring-[#111111]/20" : "border-[#D1D5DB] bg-white"}`}
                  >
                    <span className="block font-black">اختيار يدوي</span>
                    <span className={`mt-1 block text-xs leading-5 ${draft.featureSelectionMode === "CUSTOM" ? "text-white/70" : "text-muted-foreground"}`}>
                      فعّل أو ألغِ أي ميزة بشكل مستقل عن الباقة.
                    </span>
                  </button>
                </div>
              </div>

              {draft.featureSelectionMode === "CUSTOM" ? (
              <div className="rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] p-4 sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-black">اختيار المميزات يدويًا</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      تم اختيار {draft.enabledFeatures.length} من {featureKeys.length} ميزة.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => update("enabledFeatures", [...featureKeys])}
                    >
                      تحديد الكل
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => update("enabledFeatures", [])}
                    >
                      إلغاء الكل
                    </Button>
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  {FEATURE_GROUPS.map((group) => (
                    <section key={group.title}>
                      <h3 className="mb-3 text-sm font-black text-[#374151]">
                        {group.title}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {group.items.map((feature) => {
                          const checked = draft.enabledFeatures.includes(feature.key);
                          return (
                            <label
                              key={feature.key}
                              className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 transition ${checked ? "border-[#111111] ring-1 ring-[#111111]/10" : "border-[#E5E7EB] hover:border-[#9CA3AF]"}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  update(
                                    "enabledFeatures",
                                    checked
                                      ? draft.enabledFeatures.filter(
                                          (key) => key !== feature.key,
                                        )
                                      : [...draft.enabledFeatures, feature.key],
                                  )
                                }
                                className="mt-1 h-4 w-4 accent-[#111111]"
                              />
                              <span>
                                <span className="block text-sm font-black">
                                  {feature.name}
                                </span>
                                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                  {feature.description}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
              ) : (
                <div className="rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] p-4 sm:p-6">
                  <h2 className="font-black">مميزات باقة {getPlanByCode(draft.plan).name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    سيتم تفعيل {draft.enabledFeatures.length} ميزة تلقائيًا.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {FEATURE_GROUPS.flatMap((group) => group.items)
                      .filter((feature) => draft.enabledFeatures.includes(feature.key))
                      .map((feature) => (
                        <span
                          key={feature.key}
                          className="rounded-full border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-bold"
                        >
                          {feature.name}
                        </span>
                      ))}
                  </div>
                </div>
              )}
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
                <Summary label="اسم المستخدم" value={draft.ownerUsername || "—"} />
                <Summary label="الباقة" value={draft.plan} />
                <Summary
                  label="مصدر المميزات"
                  value={
                    draft.featureSelectionMode === "PLAN"
                      ? "مميزات الباقة"
                      : "اختيار يدوي"
                  }
                />
                <Summary
                  label="المميزات المفعلة"
                  value={`${draft.enabledFeatures.length} من ${featureKeys.length}`}
                />
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
