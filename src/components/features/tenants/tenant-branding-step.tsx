import { BrandAssetUpload } from "@/components/platform/brand-asset-upload";
import { TenantFormField } from "@/components/features/tenants/tenant-form-field";
import {
  tenantBrandingColors,
  tenantBrandingLabels,
  type TenantDraft,
  type UpdateTenantDraft,
} from "@/components/features/tenants/tenant-form-model";
import { Input } from "@/components/ui/input";
import type { TenantBranding } from "@/types/tenant.types";

export function TenantBrandingStep({
  draft,
  update,
  onBrandingChange,
}: {
  draft: TenantDraft;
  update: UpdateTenantDraft;
  onBrandingChange: (key: keyof TenantBranding, value: string) => void;
}) {
  return (
    <div>
      <BrandAssetUpload
        label="الشعار الرئيسي"
        kind="logo"
        value={draft.logo}
        onChange={(value) => update("logo", value || "")}
        className="mb-5 max-w-xl"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {tenantBrandingColors.map((key) => (
          <label key={key} className="text-sm font-bold">
            {tenantBrandingLabels[key]}
            <div className="mt-2 flex gap-2">
              <input
                type="color"
                value={draft.branding[key] as string}
                onChange={(event) => onBrandingChange(key, event.target.value)}
                className="h-10 w-12 rounded-lg border p-1"
              />
              <Input
                value={draft.branding[key] as string}
                onChange={(event) => onBrandingChange(key, event.target.value)}
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </label>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <TenantFormField
          label="الخط"
          value={draft.branding.fontFamily || "Cairo"}
          onChange={(value) => onBrandingChange("fontFamily", value)}
        />
        <TenantFormField
          label="نصف قطر الحواف"
          value={draft.branding.radius}
          onChange={(value) => onBrandingChange("radius", value)}
        />
      </div>
    </div>
  );
}
