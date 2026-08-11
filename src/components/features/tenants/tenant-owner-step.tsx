import { TenantFormField } from "@/components/features/tenants/tenant-form-field";
import type {
  TenantDraft,
  UpdateTenantDraft,
} from "@/components/features/tenants/tenant-form-model";

export function TenantOwnerStep({
  draft,
  editing,
  update,
}: {
  draft: TenantDraft;
  editing: boolean;
  update: UpdateTenantDraft;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TenantFormField
        label="اسم المسؤول"
        value={draft.ownerName}
        onChange={(value) => update("ownerName", value)}
      />
      <TenantFormField
        label="البريد الإلكتروني"
        value={draft.ownerEmail}
        onChange={(value) => update("ownerEmail", value)}
      />
      <TenantFormField
        label="الهاتف"
        value={draft.ownerPhone}
        onChange={(value) => update("ownerPhone", value)}
      />
      <TenantFormField
        label="اسم المستخدم"
        value={draft.ownerUsername}
        onChange={(value) => update("ownerUsername", value)}
      />
      <TenantFormField
        label={editing ? "كلمة مرور جديدة (اختياري)" : "كلمة المرور"}
        value={draft.ownerPassword}
        onChange={(value) => update("ownerPassword", value)}
        type="password"
      />
      <TenantFormField
        label={editing ? "تأكيد كلمة المرور الجديدة" : "تأكيد كلمة المرور"}
        value={draft.ownerPasswordConfirm}
        onChange={(value) => update("ownerPasswordConfirm", value)}
        type="password"
      />
      <p className="sm:col-span-2 text-xs leading-6 text-muted-foreground">
        {editing
          ? "اترك كلمة المرور فارغة للاحتفاظ بها، أو اكتب كلمة جديدة لإعادة تعيينها مباشرة بصلاحية مالك المنصة."
          : "سيستخدم مسؤول الكافيه اسم المستخدم وكلمة المرور لتسجيل الدخول إلى لوحة الإدارة."}
      </p>
    </div>
  );
}
