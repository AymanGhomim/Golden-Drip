"use client";
import { useParams } from "next/navigation";
import { TenantForm } from "@/components/platform/tenant-form";
import { tenantService } from "@/services/tenant.service";
import { AppNotFoundState } from "@/components/feedback/app-state";
export default function EditTenantPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const tenant = tenantService.getTenant(tenantId);
  if (!tenant)
    return <AppNotFoundState variant="platform" description="تعذر العثور على الكافيه المطلوب داخل لوحة إدارة المنصة." actionHref="/platform/tenants" actionLabel="العودة إلى الكافيهات" />;
  return <TenantForm tenant={tenant} />;
}
