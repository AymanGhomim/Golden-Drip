/* eslint-disable @next/next/no-img-element -- Tenant previews may use temporary data/blob URLs. */
import {
  tenantFeatureKeys,
  type TenantDraft,
} from "@/components/features/tenants/tenant-form-model";

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#D1D5DB] py-3 last:border-0">
      <span className="text-sm text-[#667085]">{label}</span>
      <span className="text-sm font-black">{value}</span>
    </div>
  );
}

export function TenantReviewStep({ draft }: { draft: TenantDraft }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3 rounded-2xl bg-[#F3F4F6] p-5">
        <h2 className="font-black">ملخص الكافيه</h2>
        <Summary label="الاسم" value={draft.name || "—"} />
        <Summary label="المعرّف المختصر" value={draft.slug || "—"} />
        <Summary label="المسؤول" value={draft.ownerName || "—"} />
        <Summary label="اسم المستخدم" value={draft.ownerUsername || "—"} />
        <Summary label="الباقة" value={draft.plan} />
        <Summary
          label="تطبيق الإدارة"
          value={
            draft.adminClientMode === "WEB"
              ? "الويب فقط"
              : draft.adminClientMode === "DESKTOP"
                ? "سطح المكتب فقط"
                : "الويب وسطح المكتب"
          }
        />
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
          value={`${draft.enabledFeatures.length} من ${tenantFeatureKeys.length}`}
        />
        <Summary
          label="الاشتراك"
          value={draft.subscriptionType === "TRIAL" ? "تجريبي" : "مدفوع"}
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
            <h2 className="font-black">{draft.name || "اسم الكافيه"}</h2>
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
  );
}
