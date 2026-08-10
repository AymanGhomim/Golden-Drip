"use client";
import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { branchService } from "@/services/branch.service";
import { useTenant } from "@/providers/tenant-provider";
import { useBranch } from "@/providers/branch-provider";
import type { BranchStatus } from "@/types/branch.types";
import { AppNotFoundState } from "@/components/feedback/app-state";

export default function BranchDetailsPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const search = useSearchParams();
  const { tenant } = useTenant();
  const { refreshBranches } = useBranch();
  const branch = branchService.getBranch(branchId, tenant.id);
  const menus = branchService.getMenus(tenant.id);
  const [editing, setEditing] = useState(search.get("edit") === "1");
  const [form, setForm] = useState({
    name: branch?.name ?? "",
    code: branch?.code ?? "",
    phone: branch?.phone ?? "",
    email: branch?.email ?? "",
    address: branch?.address ?? "",
    status: (branch?.status ?? "ACTIVE") as BranchStatus,
    menuId: branch?.menuId ?? "",
  });
  if (!branch)
    return (
      <AdminShell>
        <AppNotFoundState variant="cafe" description="تعذر العثور على الفرع المطلوب داخل هذا الكافيه." actionHref="/admin/branches" actionLabel="العودة إلى الفروع" />
      </AdminShell>
    );
  const save = () => {
    if (!form.name.trim()) return toast.error("اسم الفرع مطلوب");
    branchService.updateBranch(branch.id, form, tenant.id);
    refreshBranches();
    setEditing(false);
    toast.success("تم حفظ بيانات الفرع");
  };
  return (
    <AdminShell>
      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5"
      >
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-accent">الفروع</p>
            <h1 className="mt-1 text-2xl font-black">{branch.name}</h1>
            <div className="mt-2 flex gap-2">
              <Badge>{branch.status === "ACTIVE" ? "نشط" : "متوقف"}</Badge>
              <Badge variant="outline">
                {menus.find((menu) => menu.id === branch.menuId)?.name ??
                  "بدون منيو"}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setEditing((value) => !value)}
          >
            {editing ? "إلغاء التعديل" : "تعديل"}
          </Button>
        </div>
        <div className="mb-4 flex gap-2 border-b pb-3 text-sm font-bold">
          <span className="rounded-lg bg-primary px-3 py-2 text-primary-foreground">
            نظرة عامة
          </span>
          <span className="px-3 py-2 text-muted-foreground">المنيو</span>
          <span className="px-3 py-2 text-muted-foreground">التشغيل</span>
          <span className="px-3 py-2 text-muted-foreground">الطاولات</span>
          <span className="px-3 py-2 text-muted-foreground">الإعدادات</span>
        </div>
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <Field
              label="اسم الفرع"
              value={form.name}
              disabled={!editing}
              onChange={(name) => setForm({ ...form, name })}
            />
            <Field
              label="الكود"
              value={form.code}
              disabled={!editing}
              onChange={(code) => setForm({ ...form, code })}
            />
            <Field
              label="الهاتف"
              value={form.phone}
              disabled={!editing}
              onChange={(phone) => setForm({ ...form, phone })}
            />
            <Field
              label="البريد"
              value={form.email}
              disabled={!editing}
              onChange={(email) => setForm({ ...form, email })}
            />
            <div className="sm:col-span-2">
              <Field
                label="العنوان"
                value={form.address}
                disabled={!editing}
                onChange={(address) => setForm({ ...form, address })}
              />
            </div>
            <label className="text-sm font-bold">
              المنيو الحالي
              <select
                disabled={!editing}
                value={form.menuId}
                onChange={(event) =>
                  setForm({ ...form, menuId: event.target.value })
                }
                className="mt-2 h-10 w-full rounded-lg border bg-background px-3 disabled:opacity-70"
              >
                <option value="">بدون منيو</option>
                {menus
                  .filter((menu) => menu.status === "ACTIVE")
                  .map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="text-sm font-bold">
              الحالة
              <select
                disabled={!editing}
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value as BranchStatus,
                  })
                }
                className="mt-2 h-10 w-full rounded-lg border bg-background px-3 disabled:opacity-70"
              >
                <option value="ACTIVE">نشط</option>
                <option value="INACTIVE">متوقف</option>
              </select>
            </label>
            {editing ? (
              <Button className="sm:col-span-2" onClick={save}>
                حفظ التغييرات
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
function Field({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-bold">
      {label}
      <Input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2"
      />
    </label>
  );
}
