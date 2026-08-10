"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TenantDetailHeader,
  TenantTabs,
  statusLabels,
} from "@/components/platform/tenant-detail-header";
import { tenantService } from "@/services/tenant.service";
import {
  getEffectiveFeatures,
  FEATURE_GROUPS,
  getPlanByCode,
} from "@/config/plans.config";
import {
  branchService,
  getEffectiveBranchLimit,
} from "@/services/branch.service";
import { AppNotFoundState } from "@/components/feedback/app-state";

export default function TenantDetailsPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [revision, setRevision] = useState(0);
  const tenant = tenantService.getTenant(tenantId);
  if (!tenant)
    return <AppNotFoundState variant="platform" description="تعذر العثور على الكافيه المطلوب داخل لوحة إدارة المنصة." actionHref="/platform/tenants" actionLabel="العودة إلى الكافيهات" />;
  const features = getEffectiveFeatures(tenant.plan, tenant.featureOverrides);
  const plan = getPlanByCode(tenant.plan);
  const branches = branchService.getBranches(tenant.id);
  const menus = branchService.getMenus(tenant.id);
  void revision;
  const end = tenant.subscription?.endsAt
    ? new Date(tenant.subscription.endsAt)
    : null;
  const days = end
    ? Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000))
    : null;
  return (
    <section className="mx-auto max-w-[1500px] p-5 sm:p-10">
      <TenantDetailHeader tenant={tenant} />
      <TenantTabs id={tenant.id} active="overview" />
      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          onClick={() => {
            tenantService.selectDevelopmentTenant(tenant.id);
            window.location.assign(
              `/admin/dashboard?tenantId=${encodeURIComponent(tenant.id)}`,
            );
          }}
        >
          فتح لوحة تحكم {tenant.name}
        </Button>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="font-black">بيانات الكافيه</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="الهاتف" value={tenant.contact?.phone || "—"} />
              <Row label="WhatsApp" value={tenant.contact?.whatsapp || "—"} />
              <Row label="البريد" value={tenant.contact?.email || "—"} />
              <Row label="العنوان" value={tenant.contact?.address || "—"} />
              <Row label="المسؤول" value={tenant.owner?.name || "—"} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="font-black">الاشتراك</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="الباقة" value={tenant.plan} />
              <Row label="الحالة" value={statusLabels[tenant.status]} />
              <Row
                label="البداية"
                value={tenant.subscription?.startsAt?.slice(0, 10) || "—"}
              />
              <Row
                label="النهاية"
                value={tenant.subscription?.endsAt?.slice(0, 10) || "—"}
              />
              <Row
                label="الأيام المتبقية"
                value={days === null ? "—" : `${days} يوم`}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="font-black">حد الفروع</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Row
                label="الفروع المستخدمة"
                value={`${branches.length} / ${getEffectiveBranchLimit(tenant)}`}
              />
              <Row
                label="الحد الافتراضي للباقة"
                value={`${plan.maxBranches} فروع`}
              />
              <Row
                label="الحد المخصص"
                value={
                  tenant.maxBranchesOverride
                    ? `${tenant.maxBranchesOverride} فروع`
                    : "غير محدد"
                }
              />
              <Row
                label="الحد الفعلي"
                value={`${getEffectiveBranchLimit(tenant)} فروع`}
              />
            </div>
            <label className="mt-5 block text-sm font-bold">
              الحد الأقصى للفروع
              <select
                defaultValue={tenant.maxBranchesOverride ? "custom" : "plan"}
                onChange={(event) => {
                  const custom = event.target.value === "custom";
                  tenantService.updateTenant(tenant.id, {
                    maxBranchesOverride: custom
                      ? Math.max(
                          plan.maxBranches,
                          tenant.maxBranchesOverride ?? plan.maxBranches,
                        )
                      : undefined,
                  });
                  setRevision((value) => value + 1);
                }}
                className="mt-2 h-10 w-full rounded-lg border bg-background px-3"
              >
                <option value="plan">استخدام حد الباقة</option>
                <option value="custom">تحديد حد مخصص</option>
              </select>
            </label>
            {tenant.maxBranchesOverride !== undefined ? (
              <label className="mt-3 block text-sm font-bold">
                الحد المخصص
                <input
                  type="number"
                  min="1"
                  value={tenant.maxBranchesOverride}
                  onChange={(event) => {
                    tenantService.updateTenant(tenant.id, {
                      maxBranchesOverride: Math.max(
                        1,
                        Number(event.target.value),
                      ),
                    });
                    setRevision((value) => value + 1);
                  }}
                  className="mt-2 h-10 w-full rounded-lg border bg-background px-3"
                />
              </label>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="font-black">الهوية</h2>
            <div
              className="mt-4 flex items-center gap-4 rounded-2xl p-5"
              style={{
                background: tenant.branding.background,
                color: tenant.branding.textPrimary,
              }}
            >
              <img
                src={tenant.branding.logo}
                alt=""
                className="h-14 w-14 object-contain"
              />
              <div>
                <p className="font-black">{tenant.name}</p>
                <p className="text-xs opacity-70">
                  {tenant.branding.fontFamily || "Cairo"}
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="mt-4">
              <Link href={`/platform/tenants/${tenant.id}/branding`}>
                تخصيص الهوية
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="font-black">المميزات الفعالة</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {FEATURE_GROUPS.flatMap((group) => group.items)
                .filter((item) => features[item.key])
                .map((item) => (
                  <span
                    key={item.key}
                    className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-700"
                  >
                    {item.name}
                  </span>
                ))}
            </div>
            <Button asChild variant="outline" className="mt-4">
              <Link href={`/platform/tenants/${tenant.id}/features`}>
                إدارة المميزات
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-5">
        <CardContent className="overflow-x-auto p-0">
          <div className="border-b p-5">
            <h2 className="font-black">فروع الكافيه</h2>
          </div>
          <table className="w-full min-w-[650px] text-right text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3">اسم الفرع</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">المنيو</th>
                <th className="px-4 py-3">تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.id} className="border-t">
                  <td className="px-4 py-3 font-bold">{branch.name}</td>
                  <td className="px-4 py-3">
                    {branch.status === "ACTIVE" ? "نشط" : "متوقف"}
                  </td>
                  <td className="px-4 py-3">
                    {menus.find((menu) => menu.id === branch.menuId)?.name ??
                      "—"}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(branch.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!branches.length ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              لا توجد فروع لهذا الكافيه.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
