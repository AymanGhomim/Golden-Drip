"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { PermissionGate } from "@/components/access/permission-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/money";
import { useTenant } from "@/providers/tenant-provider";
import { cafeOperationsService } from "@/services/cafe-operations.service";
import { customerService } from "@/services/customer.service";
import type { Customer } from "@/types/cafe-operations.types";
const empty = { name: "", phone: "", email: "", address: "" };
export default function CustomersPage() {
  const { tenant } = useTenant();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(empty);
  const reload = () => setCustomers(customerService.getCustomers());
  useEffect(() => {
    reload();
    const reset = () => {
      reload();
      setOpen(false);
      setQuery("");
    };
    window.addEventListener("operations:changed", reload);
    window.addEventListener("tenant:changed", reset);
    return () => {
      window.removeEventListener("operations:changed", reload);
      window.removeEventListener("tenant:changed", reset);
    };
  }, []);
  const filtered = useMemo(
    () =>
      customers.filter((c) =>
        `${c.name} ${c.phone ?? ""} ${c.email ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [customers, query],
  );
  function save() {
    if (!form.name.trim()) return toast.error("اسم العميل مطلوب.");
    const customer = cafeOperationsService.create<Customer>("customers", {
      ...form,
      name: form.name.trim(),
      active: true,
      createdAt: new Date().toISOString(),
    });
    cafeOperationsService.audit({
      module: "customers",
      action: "CUSTOMER_CREATED",
      description: `تمت إضافة العميل ${customer.name}`,
      entityType: "customer",
      entityId: customer.id,
    });
    setOpen(false);
    setForm(empty);
    reload();
    toast.success("تمت إضافة العميل.");
  }
  return (
    <AdminShell>
      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5"
      >
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-accent">العملاء</p>
            <h1 className="text-2xl font-black">العملاء</h1>
            <p className="text-sm text-muted-foreground">
              ملفات عملاء الكافيه وإحصاءاتهم المشتقة من الطلبات.
            </p>
          </div>
          <PermissionGate permission="customers.manage">
            <Button onClick={() => setOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة عميل
            </Button>
          </PermissionGate>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="border-b p-4">
              <Input
                className="max-w-sm"
                placeholder="بحث بالاسم أو الهاتف"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-right text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {[
                      "الاسم",
                      "الهاتف",
                      "عدد الطلبات",
                      "إجمالي الإنفاق",
                      "متوسط الطلب",
                      "نقاط الولاء",
                      "آخر طلب",
                      "تاريخ التسجيل",
                      "الإجراءات",
                    ].map((h) => (
                      <th key={h} className="px-4 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((customer) => {
                    const analytics = customerService.getCustomerAnalytics(
                      customer.id,
                    );
                    return (
                      <tr key={customer.id} className="border-t">
                        <td className="px-4 py-3 font-bold">{customer.name}</td>
                        <td className="px-4 py-3">{customer.phone ?? "—"}</td>
                        <td className="px-4 py-3">{analytics.orderCount}</td>
                        <td className="px-4 py-3">
                          {formatMoney(
                            analytics.totalSpend,
                            tenant.settings.currencySymbol,
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {formatMoney(
                            analytics.averageOrder,
                            tenant.settings.currencySymbol,
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {customerService.getLoyaltyBalance(customer.id)}
                        </td>
                        <td className="px-4 py-3">
                          {analytics.lastVisit
                            ? new Date(analytics.lastVisit).toLocaleDateString(
                                "ar-EG",
                              )
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(customer.createdAt).toLocaleDateString(
                            "ar-EG",
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/customers/${customer.id}`}>
                              <Eye className="ml-1 h-4 w-4" />
                              عرض
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!filtered.length ? (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  لا يوجد عملاء حتى الآن.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة عميل</DialogTitle>
              <DialogDescription>
                العميل متاح لكل فروع الكافيه.
              </DialogDescription>
            </DialogHeader>
            {(
              [
                ["name", "الاسم *", "text"],
                ["phone", "الهاتف", "tel"],
                ["email", "البريد الإلكتروني", "email"],
                ["address", "العنوان", "text"],
              ] as const
            ).map(([key, label, type]) => (
              <label key={key} className="text-sm font-bold">
                {label}
                <Input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
            <Button onClick={save}>حفظ العميل</Button>
          </DialogContent>
        </Dialog>
      </section>
    </AdminShell>
  );
}
