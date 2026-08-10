"use client";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TenantDetailHeader,
  TenantTabs,
} from "@/components/platform/tenant-detail-header";
import { tenantService } from "@/services/tenant.service";
import { useState } from "react";
import { AppNotFoundState } from "@/components/feedback/app-state";

export default function TenantSubscriptionPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const tenant = tenantService.getTenant(tenantId);
  const [months, setMonths] = useState("1");
  if (!tenant)
    return <AppNotFoundState variant="platform" description="تعذر العثور على الكافيه المطلوب داخل لوحة إدارة المنصة." actionHref="/platform/tenants" actionLabel="العودة إلى الكافيهات" />;
  const extend = () => {
    const current = tenant.subscription?.endsAt
      ? new Date(tenant.subscription.endsAt)
      : new Date();
    current.setMonth(current.getMonth() + Number(months));
    tenantService.updateTenant(tenant.id, {
      subscription: {
        type: tenant.subscription?.type || "PAID",
        startsAt: tenant.subscription?.startsAt || new Date().toISOString(),
        endsAt: current.toISOString(),
      },
      status: "ACTIVE",
      subscriptionStatus: "ACTIVE",
    });
    toast.success("تم تمديد الاشتراك في التخزين التجريبي");
  };
  return (
    <section className="mx-auto max-w-[1500px] p-5 sm:p-10">
      <TenantDetailHeader tenant={tenant} />
      <TenantTabs id={tenant.id} active="subscription" />
      <Card className="mt-6 max-w-2xl">
        <CardContent className="p-6">
          <h2 className="text-xl font-black">إدارة الاشتراك</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">الحالة</p>
              <p className="mt-1 font-bold">{tenant.subscriptionStatus}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ينتهي في</p>
              <p className="mt-1 font-bold">
                {tenant.subscription?.endsAt?.slice(0, 10) || "—"}
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-end gap-3">
            <label className="text-sm font-bold">
              تمديد الاشتراك
              <select
                value={months}
                onChange={(event) => setMonths(event.target.value)}
                className="mt-2 block h-10 rounded-lg border bg-background px-3"
              >
                <option value="1">شهر واحد</option>
                <option value="3">3 أشهر</option>
                <option value="6">6 أشهر</option>
                <option value="12">سنة</option>
              </select>
            </label>
            <Button onClick={extend}>تمديد الاشتراك</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
