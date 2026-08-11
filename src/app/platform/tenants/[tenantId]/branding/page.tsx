"use client";
/* eslint-disable @next/next/no-img-element -- Live branding previews intentionally support data/blob URLs. */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { tenantService } from "@/services/tenant.service";
import {
  TenantDetailHeader,
  TenantTabs,
} from "@/components/platform/tenant-detail-header";
import type { Tenant, TenantBranding } from "@/types/tenant.types";
import { AppNotFoundState } from "@/components/feedback/app-state";
import { BrandAssetUpload } from "@/components/platform/brand-asset-upload";
import {
  normalizeTenantBranding,
  TENANT_FONT_OPTIONS,
  tenantBrandingCssVariables,
} from "@/lib/tenant-branding";

const colorFields: [keyof TenantBranding, string][] = [
  ["primary", "اللون الأساسي"],
  ["primaryForeground", "نص اللون الأساسي"],
  ["secondary", "اللون الثانوي"],
  ["secondaryForeground", "نص اللون الثانوي"],
  ["accent", "لون الإبراز"],
  ["accentForeground", "نص لون الإبراز"],
  ["background", "الخلفية"],
  ["surface", "البطاقات"],
  ["surfaceSecondary", "السطح الثانوي"],
  ["sidebar", "السايدبار"],
  ["sidebarText", "نص السايدبار"],
  ["sidebarActive", "العنصر النشط بالسايدبار"],
  ["sidebarActiveForeground", "نص العنصر النشط"],
  ["textPrimary", "النص الأساسي"],
  ["textSecondary", "النص الثانوي"],
  ["muted", "الخلفية الهادئة"],
  ["border", "الحدود"],
];
export default function TenantBrandingPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const tenant = tenantService.getTenant(tenantId);
  if (!tenant)
    return <AppNotFoundState variant="platform" description="تعذر العثور على الكافيه المطلوب داخل لوحة إدارة المنصة." actionHref="/platform/tenants" actionLabel="العودة إلى الكافيهات" />;
  return <BrandingEditor tenant={tenant} />;
}
function BrandingEditor({ tenant }: { tenant: Tenant }) {
  const initialBranding = useMemo(() => normalizeTenantBranding(tenant.branding), [tenant.branding]);
  const [branding, setBranding] = useState<TenantBranding>(() => initialBranding);
  const [savedBranding, setSavedBranding] = useState<TenantBranding>(() => initialBranding);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState("admin");
  const isDirty = JSON.stringify(branding) !== JSON.stringify(savedBranding);
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);
  const update = (key: keyof TenantBranding, value: string) =>
    setBranding((current) => ({ ...current, [key]: value }));
  const save = () => {
    const normalized = normalizeTenantBranding(branding);
    setSaving(true);
    try {
      tenantService.updateTenant(tenant.id, { branding: normalized });
      setBranding(normalized);
      setSavedBranding(normalized);
      toast.success("تم حفظ التغييرات بنجاح");
    } catch {
      toast.error(
        "تعذر حفظ الصور محليًا. جرّب صورة أصغر أو احذف بيانات الموقع المحلية.",
      );
    } finally { setSaving(false); }
  };
  const reset = () => setBranding({ ...savedBranding });
  return (
    <section className="mx-auto max-w-[1500px] p-5 sm:p-10">
      <TenantDetailHeader tenant={{ ...tenant, branding }} />
      <TenantTabs id={tenant.id} active="branding" />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_430px]">
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-wrap gap-2 border-b pb-4">
              {[
                ["identity", "الهوية"],
                ["colors", "الألوان"],
                ["font", "الخط"],
                ["login", "تسجيل الدخول"],
                ["menu", "المنيو الإلكتروني"],
                ["receipt", "الفاتورة"],
                ["qr", "QR"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className={`rounded-lg px-3 py-2 text-sm font-bold ${mode === key ? "bg-[#111111] text-white" : "text-[#374151] hover:bg-[#F3F4F6]"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {mode === "identity" ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="اسم الكافيه" value={tenant.name} disabled />
                <BrandAssetUpload
                  label="الشعار الرئيسي"
                  kind="logo"
                  value={branding.logo}
                  onChange={(value) => update("logo", value || "")}
                />
                <BrandAssetUpload
                  label="الشعار الفاتح"
                  kind="logo"
                  value={branding.lightLogo || ""}
                  onChange={(value) => update("lightLogo", value || "")}
                />
                <BrandAssetUpload
                  label="الشعار الداكن"
                  kind="logo"
                  value={branding.darkLogo || ""}
                  onChange={(value) => update("darkLogo", value || "")}
                />
                <BrandAssetUpload
                  label="أيقونة الموقع"
                  kind="favicon"
                  value={branding.favicon || ""}
                  onChange={(value) => update("favicon", value || "")}
                />
              </div>
            ) : null}
            {mode === "colors" ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {colorFields.map(([key, label]) => (
                  <label key={key} className="text-sm font-bold">
                    {label}
                    <div className="mt-2 flex gap-2">
                      <input
                        type="color"
                        value={String(branding[key])}
                        onChange={(event) => update(key, event.target.value)}
                        className="h-10 w-12 rounded-lg border p-1"
                      />
                      <Input
                        value={String(branding[key])}
                        onChange={(event) => update(key, event.target.value)}
                        pattern="^#[0-9A-Fa-f]{6}$"
                      />
                    </div>
                  </label>
                ))}
              </div>
            ) : null}
            {mode === "font" ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-bold">
                  الخط
                  <select
                    value={branding.fontFamily || "Cairo"}
                    onChange={(event) =>
                      update("fontFamily", event.target.value)
                    }
                    className="mt-2 h-10 w-full rounded-lg border bg-background px-3"
                  >
                    {TENANT_FONT_OPTIONS.map((font) => (
                      <option key={font}>{font}</option>
                    ))}
                  </select>
                </label>
                <Field
                  label="نصف قطر الحواف"
                  value={branding.radius}
                  onChange={(value) => update("radius", value)}
                />
              </div>
            ) : null}
            {mode === "login" ? (
              <div className="mt-6 grid gap-4">
                <BrandAssetUpload
                  label="صورة خلفية تسجيل الدخول"
                  kind="loginBackground"
                  value={branding.login?.backgroundImage}
                  onChange={(value) =>
                    setBranding((current) => ({
                      ...current,
                      login: {
                        ...(current.login || {
                          backgroundColor: current.background,
                          welcomeTitle: "",
                          subtitle: "",
                          cardStyle: "solid",
                        }),
                        backgroundImage: value,
                      },
                    }))
                  }
                />
                <p className="-mt-2 text-xs text-[#667085]">
                  عند حذف الصورة سيتم استخدام لون الخلفية فقط.
                </p>
                <Field
                  label="عنوان الترحيب"
                  value={branding.login?.welcomeTitle || ""}
                  onChange={(value) =>
                    setBranding((current) => ({
                      ...current,
                      login: {
                        ...(current.login || {
                          backgroundColor: current.background,
                          subtitle: "",
                          cardStyle: "solid",
                        }),
                        welcomeTitle: value,
                      },
                    }))
                  }
                />
                <Field
                  label="الوصف"
                  value={branding.login?.subtitle || ""}
                  onChange={(value) =>
                    setBranding((current) => ({
                      ...current,
                      login: {
                        ...(current.login || {
                          backgroundColor: current.background,
                          welcomeTitle: "",
                          cardStyle: "solid",
                        }),
                        subtitle: value,
                      },
                    }))
                  }
                />
                <Field
                  label="لون خلفية الدخول"
                  value={branding.login?.backgroundColor || branding.background}
                  onChange={(value) =>
                    setBranding((current) => ({
                      ...current,
                      login: {
                        ...(current.login || {
                          welcomeTitle: "",
                          subtitle: "",
                          cardStyle: "solid",
                        }),
                        backgroundColor: value,
                      },
                    }))
                  }
                />
              </div>
            ) : null}
            {mode === "menu" ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  label="عنوان الهيدر"
                  value={branding.menu?.headerText || tenant.name}
                  onChange={(value) =>
                    setBranding((current) => ({
                      ...current,
                      menu: {
                        ...(current.menu || { categoryAccent: current.accent }),
                        headerText: value,
                      },
                    }))
                  }
                />
                <Field
                  label="لون أقسام المنيو"
                  value={branding.menu?.categoryAccent || branding.accent}
                  onChange={(value) =>
                    setBranding((current) => ({
                      ...current,
                      menu: {
                        ...(current.menu || { headerText: tenant.name }),
                        categoryAccent: value,
                      },
                    }))
                  }
                />
              </div>
            ) : null}
            {mode === "receipt" ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  label="هاتف الفاتورة"
                  value={branding.receipt?.phone || ""}
                  onChange={(value) =>
                    setBranding((current) => ({
                      ...current,
                      receipt: {
                        ...(current.receipt || { showQr: true }),
                        phone: value,
                      },
                    }))
                  }
                />
                <Field
                  label="العنوان"
                  value={branding.receipt?.address || ""}
                  onChange={(value) =>
                    setBranding((current) => ({
                      ...current,
                      receipt: {
                        ...(current.receipt || { showQr: true }),
                        address: value,
                      },
                    }))
                  }
                />
                <Field
                  label="الرقم الضريبي"
                  value={branding.receipt?.taxNumber || ""}
                  onChange={(value) =>
                    setBranding((current) => ({
                      ...current,
                      receipt: {
                        ...(current.receipt || { showQr: true }),
                        taxNumber: value,
                      },
                    }))
                  }
                />
                <Field
                  label="تذييل الفاتورة"
                  value={branding.receipt?.footer || ""}
                  onChange={(value) =>
                    setBranding((current) => ({
                      ...current,
                      receipt: {
                        ...(current.receipt || { showQr: true }),
                        footer: value,
                      },
                    }))
                  }
                />
              </div>
            ) : null}
            {mode === "qr" ? (
              <div className="mt-6 grid gap-4">
                <Field
                  label="لون QR"
                  value={branding.qr?.foregroundColor || branding.primary}
                  onChange={(value) =>
                    setBranding((current) => ({
                      ...current,
                      qr: {
                        ...(current.qr || {
                          title: "افتح المنيو",
                          helperText: "امسح الكود للطلب",
                        }),
                        foregroundColor: value,
                      },
                    }))
                  }
                />
                <Field
                  label="عنوان البطاقة"
                  value={branding.qr?.title || ""}
                  onChange={(value) =>
                    setBranding((current) => ({
                      ...current,
                      qr: {
                        ...(current.qr || {
                          foregroundColor: current.primary,
                          helperText: "",
                        }),
                        title: value,
                      },
                    }))
                  }
                />
                <Field
                  label="النص المساعد"
                  value={branding.qr?.helperText || ""}
                  onChange={(value) =>
                    setBranding((current) => ({
                      ...current,
                      qr: {
                        ...(current.qr || {
                          foregroundColor: current.primary,
                          title: "افتح المنيو",
                        }),
                        helperText: value,
                      },
                    }))
                  }
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Preview tenant={tenant} branding={branding} mode={mode} />
        <div className="xl:col-span-2 flex justify-end gap-2">
          <Button variant="outline" onClick={reset} disabled={!isDirty || saving}>
            <RotateCcw className="ml-2 h-4 w-4" />
            إلغاء التغييرات
          </Button>
          <Button onClick={save} disabled={!isDirty || saving}>
            <Save className="ml-2 h-4 w-4" />
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </div>
    </section>
  );
}
function Preview({
  tenant,
  branding,
  mode,
}: {
  tenant: Tenant;
  branding: TenantBranding;
  mode: string;
}) {
  const normalized = normalizeTenantBranding(branding);
  return (
    <Card className="h-fit overflow-hidden">
      <CardContent className="p-0">
        <div className="border-b p-4 text-sm font-black">
          معاينة مباشرة ·{" "}
          {mode === "admin"
            ? "لوحة التحكم"
            : mode === "login"
              ? "تسجيل الدخول"
              : mode === "menu"
                ? "المنيو الإلكتروني"
                : mode === "receipt"
                  ? "الفاتورة"
                  : "الهوية"}
        </div>
        <div
          className="tenant-theme min-h-[420px] p-5"
          style={{
            ...tenantBrandingCssVariables(normalized),
            backgroundColor:
              mode === "login"
                ? normalized.login?.backgroundColor || normalized.background
                : normalized.background,
            backgroundImage:
              mode === "login" && normalized.login?.backgroundImage
                ? `linear-gradient(rgb(0 0 0 / 18%), rgb(0 0 0 / 18%)), url("${normalized.login.backgroundImage}")`
                : undefined,
            backgroundPosition: "center",
            backgroundSize: "cover",
            color: normalized.textPrimary,
          }}
        >
          <div
            className="rounded-2xl p-4"
            style={{
              backgroundColor: normalized.sidebar,
              color: normalized.sidebarText,
            }}
          >
            <div className="flex items-center gap-3">
              <img
                src={normalized.logo}
                alt=""
                className="h-10 w-10 object-contain"
              />
              <span className="font-black">{tenant.name}</span>
            </div>
            <div className="mt-5 space-y-2 text-xs">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: normalized.sidebarActive, color: normalized.sidebarActiveForeground }}
              >
                لوحة التحكم
              </div>
              <div className="p-2">الطلبات</div>
            </div>
          </div>
          <div
            className="mt-4 rounded-2xl p-5"
            style={{
              backgroundColor: normalized.surface,
              border: `1px solid ${normalized.border}`,
            }}
          >
            {mode === "login" ? (
              <>
                <h2 className="text-xl font-black">
                  {normalized.login?.welcomeTitle || "مرحبًا بك"}
                </h2>
                <p className="mt-1 text-sm opacity-70">
                  {normalized.login?.subtitle}
                </p>
                <button
                  type="button"
                  className="mt-5 rounded-lg px-5 py-2 text-sm font-bold text-white"
                  style={{ backgroundColor: normalized.primary, color: normalized.primaryForeground }}
                >
                  تسجيل الدخول
                </button>
              </>
            ) : mode === "receipt" ? (
              <>
                <div className="text-center">
                  <img
                    src={normalized.logo}
                    alt=""
                    className="mx-auto h-12 w-12 object-contain"
                  />
                  <p className="mt-2 font-black">{tenant.name}</p>
                </div>
                <div className="mt-8 border-t pt-4 text-sm">
                  <div className="flex justify-between">
                    <span>الإجمالي</span>
                    <b>320 ج.م</b>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p
                  className="text-xs font-bold"
                  style={{ color: normalized.accent }}
                >
                  مرحبًا بك
                </p>
                <h2 className="mt-2 text-xl font-black">{tenant.name}</h2>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border p-4">
                    <p className="text-xs opacity-70">مبيعات اليوم</p>
                    <p className="mt-2 text-xl font-black">12,450</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl p-4 text-right text-sm font-bold text-white"
                    style={{ backgroundColor: normalized.primary, color: normalized.primaryForeground }}
                  >
                    إضافة طلب
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
function Field({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="text-sm font-bold">
      {label}
      <Input
        disabled={disabled}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="mt-2"
      />
    </label>
  );
}
