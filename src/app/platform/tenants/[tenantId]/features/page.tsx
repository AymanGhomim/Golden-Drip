"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FEATURE_GROUPS,
  getEffectiveFeatures,
  getPlanByCode,
} from "@/config/plans.config";
import { tenantService } from "@/services/tenant.service";
import {
  TenantDetailHeader,
  TenantTabs,
} from "@/components/platform/tenant-detail-header";
import type { FeatureKey } from "@/types/platform.types";
import { AppNotFoundState } from "@/components/feedback/app-state";

export default function TenantFeaturesPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const tenant = tenantService.getTenant(tenantId);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({
    ...(tenant?.featureOverrides || {}),
  } as Record<string, boolean>);
  if (!tenant)
    return <AppNotFoundState variant="platform" description="تعذر العثور على الكافيه المطلوب داخل لوحة إدارة المنصة." actionHref="/platform/tenants" actionLabel="العودة إلى الكافيهات" />;
  const effective = getEffectiveFeatures(tenant.plan, overrides);
  const plan = getPlanByCode(
    tenant.plan === "STARTER"
      ? "BASIC"
      : tenant.plan === "GROWTH"
        ? "PRO"
        : "PREMIUM",
  );
  const save = () => {
    tenantService.updateTenant(tenant.id, { featureOverrides: overrides });
    toast.success("تم حفظ المميزات");
  };
  const toggle = (key: FeatureKey) =>
    setOverrides((current) => ({ ...current, [key]: !effective[key] }));
  return (
    <section className="mx-auto max-w-[1500px] p-5 sm:p-10">
      <TenantDetailHeader tenant={tenant} />
      <TenantTabs id={tenant.id} active="features" />
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {FEATURE_GROUPS.map((group) => (
          <Card key={group.title}>
            <CardContent className="p-5">
              <h2 className="font-black">{group.title}</h2>
              <div className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3 rounded-xl border p-3"
                  >
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      <p className="mt-1 text-[11px] text-[#374151]">
                        {plan.features.includes(item.key)
                          ? "متاحة ضمن الباقة"
                          : "غير متاحة ضمن الباقة"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle(item.key)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border ${effective[item.key] ? "border-emerald-600 bg-emerald-600 text-white" : "bg-white text-muted-foreground"}`}
                      aria-label={
                        effective[item.key] ? "تعطيل الميزة" : "تفعيل الميزة"
                      }
                    >
                      {effective[item.key] ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <ShieldCheck className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={save}>حفظ المميزات</Button>
      </div>
    </section>
  );
}
