"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { tenantService } from "@/services/tenant.service";
import { getPlanByCode } from "@/config/plans.config";
import { toast } from "sonner";
import { SearchInput } from "@/components/shared/search-input";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePagination } from "@/hooks/use-pagination";
import { formatDate } from "@/lib/formatters";

export default function PlatformSubscriptionsPage() {
  const [, refresh] = useState(0);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const debouncedQuery = useDebouncedValue(query);
  const tenants = tenantService.listTenants();
  const filteredTenants = useMemo(() => tenants.filter((tenant) => {
    const matchesQuery = !debouncedQuery || `${tenant.name} ${tenant.slug}`.toLocaleLowerCase("ar").includes(debouncedQuery.toLocaleLowerCase("ar"));
    return matchesQuery && (statusFilter === "ALL" || tenant.subscriptionStatus === statusFilter);
  }), [debouncedQuery, statusFilter, tenants]);
  const pagination = usePagination(filteredTenants, `${debouncedQuery}:${statusFilter}`);
  const active = tenants.filter((tenant) => tenant.status === "ACTIVE").length;
  const trial = tenants.filter((tenant) => tenant.status === "TRIAL").length;
  const suspended = tenants.filter(
    (tenant) => tenant.status === "SUSPENDED",
  ).length;
  const extend = (id: string) => {
    const tenant = tenantService.getTenant(id);
    if (!tenant) return;
    const date = tenant.subscription?.endsAt
      ? new Date(tenant.subscription.endsAt)
      : new Date();
    date.setMonth(date.getMonth() + 1);
    tenantService.updateTenant(id, {
      status: "ACTIVE",
      subscriptionStatus: "ACTIVE",
      subscription: {
        type: tenant.subscription?.type || "PAID",
        startsAt: tenant.subscription?.startsAt || new Date().toISOString(),
        endsAt: date.toISOString(),
      },
    });
    refresh((value) => value + 1);
    toast.success("تم تمديد الاشتراك شهرًا");
  };
  return (
    <section className="mx-auto max-w-[1500px] p-5 sm:p-10">
      <h1 className="text-3xl font-black">الاشتراكات</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        متابعة الخطط والحالات والتواريخ. هذه العمليات محلية للتطوير فقط.
      </p>
      <div className="mt-7 grid gap-4 sm:grid-cols-4">
        {[
          ["النشطة", active],
          ["التجريبية", trial],
          [
            "تنتهي قريبًا",
            tenants.filter(
              (tenant) =>
                tenant.subscription?.endsAt &&
                Math.ceil(
                  (new Date(tenant.subscription.endsAt).getTime() -
                    Date.now()) /
                    86400000,
                ) <= 30,
            ).length,
          ],
          ["الموقوفة", suspended],
        ].map(([label, value]) => (
          <Card key={label as string}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-black">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-6"><CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_220px]"><SearchInput value={query} onChange={setQuery} placeholder="بحث باسم الكافيه أو المعرّف المختصر" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-lg border bg-background px-3 text-sm" aria-label="تصفية حسب حالة الاشتراك"><option value="ALL">كل حالات الاشتراك</option><option value="ACTIVE">نشط</option><option value="TRIAL">تجريبي</option><option value="SUSPENDED">موقوف</option><option value="EXPIRED">منتهي</option></select></CardContent></Card>
      <div className="mt-6 overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full min-w-[850px] text-right text-sm">
          <thead className="bg-[#F3F4F6]">
            <tr>
              {[
                "الكافيه",
                "الباقة",
                "الحالة",
                "تاريخ البداية",
                "تاريخ النهاية",
                "الأيام المتبقية",
                "الإجراءات",
              ].map((label) => (
                <th key={label} className="p-4 font-black">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagination.items.map((tenant) => {
              const days = tenant.subscription?.endsAt
                ? Math.ceil(
                    (new Date(tenant.subscription.endsAt).getTime() -
                      Date.now()) /
                      86400000,
                  )
                : null;
              return (
                <tr key={tenant.id} className="border-t">
                  <td className="p-4">
                    <Link
                      className="font-black hover:underline"
                      href={`/platform/tenants/${tenant.id}`}
                    >
                      {tenant.name}
                    </Link>
                  </td>
                  <td className="p-4">{getPlanByCode(tenant.plan).name}</td>
                  <td className="p-4"><StatusBadge status={tenant.subscriptionStatus} /></td>
                  <td className="p-4">
                    {formatDate(tenant.subscription?.startsAt)}
                  </td>
                  <td className="p-4">
                    {formatDate(tenant.subscription?.endsAt)}
                  </td>
                  <td className="p-4">{days === null ? "—" : `${days} يوم`}</td>
                  <td className="p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => extend(tenant.id)}
                    >
                      <CalendarPlus className="ml-2 h-4 w-4" />
                      تمديد شهر
                    </Button>
                  </td>
                </tr>
              );
            })}
            {!filteredTenants.length ? <tr><td colSpan={7}><EmptyState title="لا توجد اشتراكات مطابقة" description="غيّر البحث أو حالة الاشتراك لعرض نتائج أخرى." /></td></tr> : null}
          </tbody>
        </table>
        <Pagination {...pagination.state} onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
      </div>
    </section>
  );
}
