"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminModulePage } from "@/components/admin/admin-module-page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cafeOperationsService } from "@/services/cafe-operations.service";
import type { Coupon } from "@/types/cafe-operations.types";
const empty = {
  code: "",
  type: "PERCENTAGE" as Coupon["type"],
  value: "",
  minimumOrder: "0",
  maximumDiscount: "",
  startDate: "",
  endDate: "",
};
export default function CouponsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  useEffect(() => {
    const reset = () => {
      setOpen(false);
      setForm(empty);
    };
    window.addEventListener("tenant:changed", reset);
    return () => window.removeEventListener("tenant:changed", reset);
  }, []);
  function save() {
    const value = Number(form.value);
    const minimumOrder = Number(form.minimumOrder || 0);
    const maximumDiscount = form.maximumDiscount
      ? Number(form.maximumDiscount)
      : undefined;
    if (!form.code.trim()) return toast.error("كود الكوبون مطلوب.");
    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      (form.type === "PERCENTAGE" && value > 100)
    )
      return toast.error("قيمة الخصم غير صحيحة.");
    if (
      cafeOperationsService
        .get<Coupon>("coupons")
        .some(
          (coupon) =>
            coupon.code.toLowerCase() === form.code.trim().toLowerCase(),
        )
    )
      return toast.error("كود الكوبون مستخدم بالفعل.");
    cafeOperationsService.create<Coupon>("coupons", {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value,
      minimumOrder,
      maximumDiscount,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      active: true,
    });
    setOpen(false);
    setForm(empty);
    window.dispatchEvent(new Event("operations:changed"));
    toast.success("تمت إضافة الكوبون.");
  }
  return (
    <>
      <AdminModulePage
        section="إدارة المنيو"
        title="الكوبونات"
        description="إدارة كوبونات الكافيه وتطبيقها في نقطة البيع."
        action="إضافة كوبون"
        onAdd={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة كوبون</DialogTitle>
            <DialogDescription>
              حدد نوع الخصم وحدوده وفترة صلاحيته.
            </DialogDescription>
          </DialogHeader>
          <label className="text-sm font-semibold">
            الكود *
            <Input
              className="mt-1 uppercase"
              value={form.code}
              onChange={(event) =>
                setForm((current) => ({ ...current, code: event.target.value }))
              }
            />
          </label>
          <label className="text-sm font-semibold">
            نوع الخصم
            <select
              className="mt-1 h-10 w-full rounded-md border bg-background px-3"
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  type: event.target.value as Coupon["type"],
                }))
              }
            >
              <option value="PERCENTAGE">نسبة مئوية</option>
              <option value="FIXED">مبلغ ثابت</option>
            </select>
          </label>
          {(
            [
              ["value", "القيمة *", "number"],
              ["minimumOrder", "الحد الأدنى للطلب", "number"],
              ["maximumDiscount", "الحد الأقصى للخصم", "number"],
              ["startDate", "تاريخ البداية", "date"],
              ["endDate", "تاريخ الانتهاء", "date"],
            ] as const
          ).map(([key, label, type]) => (
            <label key={key} className="text-sm font-semibold">
              {label}
              <Input
                className="mt-1"
                type={type}
                min={type === "number" ? 0 : undefined}
                value={form[key]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
              />
            </label>
          ))}
          <Button onClick={save}>حفظ الكوبون</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
