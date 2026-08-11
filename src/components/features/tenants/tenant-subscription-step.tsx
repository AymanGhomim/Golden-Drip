import { TenantFormField } from "@/components/features/tenants/tenant-form-field";
import type {
  TenantDraft,
  UpdateTenantDraft,
} from "@/components/features/tenants/tenant-form-model";
import type { TenantStatus } from "@/types/tenant.types";

export function TenantSubscriptionStep({
  draft,
  update,
}: {
  draft: TenantDraft;
  update: UpdateTenantDraft;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-bold">
        نوع الاشتراك
        <select
          value={draft.subscriptionType}
          onChange={(event) =>
            update(
              "subscriptionType",
              event.target.value as TenantDraft["subscriptionType"],
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
      <TenantFormField
        label="تاريخ البداية"
        value={draft.startsAt}
        onChange={(value) => update("startsAt", value)}
        type="date"
      />
      <TenantFormField
        label="تاريخ الانتهاء"
        value={draft.endsAt}
        onChange={(value) => update("endsAt", value)}
        type="date"
      />
    </div>
  );
}
