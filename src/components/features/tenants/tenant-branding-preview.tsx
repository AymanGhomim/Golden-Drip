/* eslint-disable @next/next/no-img-element -- Live branding previews intentionally support data/blob URLs. */
import { Card, CardContent } from "@/components/ui/card";
import {
  normalizeTenantBranding,
  tenantBrandingCssVariables,
} from "@/lib/tenant-branding";
import type { Tenant, TenantBranding } from "@/types/tenant.types";

export function TenantBrandingPreview({
  tenant,
  branding,
  mode,
}: {
  tenant: Tenant;
  branding: TenantBranding;
  mode: string;
}) {
  const normalized = normalizeTenantBranding(branding);
  const modeLabel =
    mode === "admin"
      ? "لوحة التحكم"
      : mode === "login"
        ? "تسجيل الدخول"
        : mode === "menu"
          ? "المنيو الإلكتروني"
          : mode === "receipt"
            ? "الفاتورة"
            : "الهوية";
  return (
    <Card className="h-fit overflow-hidden">
      <CardContent className="p-0">
        <div className="border-b p-4 text-sm font-black">
          معاينة مباشرة · {modeLabel}
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
                style={{
                  backgroundColor: normalized.sidebarActive,
                  color: normalized.sidebarActiveForeground,
                }}
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
                  style={{
                    backgroundColor: normalized.primary,
                    color: normalized.primaryForeground,
                  }}
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
                    style={{
                      backgroundColor: normalized.primary,
                      color: normalized.primaryForeground,
                    }}
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
