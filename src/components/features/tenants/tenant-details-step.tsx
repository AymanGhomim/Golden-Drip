import { TenantFormField } from "@/components/features/tenants/tenant-form-field";
import {
  slugifyTenant,
  type TenantDraft,
  type UpdateTenantDraft,
} from "@/components/features/tenants/tenant-form-model";
import type { AdminClientMode } from "@/types/tenant.types";

export function TenantDetailsStep({
  draft,
  duplicate,
  editing,
  update,
}: {
  draft: TenantDraft;
  duplicate: boolean;
  editing: boolean;
  update: UpdateTenantDraft;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TenantFormField
        label="اسم الكافيه"
        value={draft.name}
        onChange={(value) => {
          update("name", value);
          if (!editing) update("slug", slugifyTenant(value));
        }}
      />
      <TenantFormField
        label="المعرّف المختصر"
        value={draft.slug}
        onChange={(value) => update("slug", slugifyTenant(value))}
        error={duplicate ? "هذا الـ المعرّف المختصر مستخدم بالفعل" : undefined}
      />
      <label className="text-sm font-bold">
        تطبيق إدارة الكافيه
        <select
          required
          value={draft.adminClientMode}
          onChange={(event) =>
            update("adminClientMode", event.target.value as AdminClientMode)
          }
          className="mt-2 h-11 w-full rounded-lg border bg-background px-3"
        >
          <option value="WEB">الويب فقط</option>
          <option value="DESKTOP">سطح المكتب فقط</option>
          <option value="BOTH">الويب وسطح المكتب</option>
        </select>
      </label>
      <TenantFormField
        label="الهاتف"
        value={draft.phone}
        onChange={(value) => update("phone", value)}
      />
      <TenantFormField
        label="WhatsApp"
        value={draft.whatsapp}
        onChange={(value) => update("whatsapp", value)}
      />
      <TenantFormField
        label="البريد الإلكتروني"
        value={draft.email}
        onChange={(value) => update("email", value)}
      />
      <TenantFormField
        label="العنوان"
        value={draft.address}
        onChange={(value) => update("address", value)}
      />
      <TenantFormField
        label="رابط الموقع على الخريطة"
        value={draft.locationUrl}
        onChange={(value) => update("locationUrl", value)}
      />
      <TenantFormField
        label="Facebook"
        value={draft.facebook}
        onChange={(value) => update("facebook", value)}
      />
      <TenantFormField
        label="Instagram"
        value={draft.instagram}
        onChange={(value) => update("instagram", value)}
      />
      <TenantFormField
        label="TikTok"
        value={draft.tiktok}
        onChange={(value) => update("tiktok", value)}
      />
    </div>
  );
}
