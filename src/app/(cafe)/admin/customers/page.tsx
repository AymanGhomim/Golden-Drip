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
import type { Customer } from "@/types/cafe-operations.types";
const empty = { name: "", phone: "", email: "", address: "" };
export default function CustomersPage() {
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
    window.dispatchEvent(new Event("operations:changed"));
    toast.success("تمت إضافة العميل.");
  }
  return (
    <>
      <AdminModulePage
        section="العملاء"
        title="العملاء"
        description="اعرض ملفات العملاء واستخدمها في الطلبات."
        action="إضافة عميل"
        onAdd={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة عميل</DialogTitle>
            <DialogDescription>
              سيكون العميل متاحًا في نقطة البيع لكل فروع الكافيه.
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
            <label key={key} className="text-sm font-semibold">
              {label}
              <Input
                className="mt-1"
                type={type}
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
          <Button onClick={save}>حفظ العميل</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
