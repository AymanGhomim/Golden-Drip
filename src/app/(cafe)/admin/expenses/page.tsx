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
import type { Expense } from "@/types/cafe-operations.types";

const blank = () => ({
  category: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  notes: "",
});

export default function ExpensesPage() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blank);
  useEffect(() => {
    const reset = () => {
      setOpen(false);
      setForm(blank());
    };
    window.addEventListener("tenant:changed", reset);
    window.addEventListener("branch:changed", reset);
    return () => {
      window.removeEventListener("tenant:changed", reset);
      window.removeEventListener("branch:changed", reset);
    };
  }, []);
  function save() {
    const amount = Number(form.amount);
    if (!form.category.trim()) return toast.error("تصنيف المصروف مطلوب.");
    if (!Number.isFinite(amount) || amount <= 0)
      return toast.error("قيمة المصروف يجب أن تكون أكبر من صفر.");
    if (!form.date) return toast.error("تاريخ المصروف مطلوب.");
    setSaving(true);
    try {
      const expense = cafeOperationsService.create<Expense>("expenses", {
        category: form.category.trim(),
        amount,
        date: form.date,
        notes: form.notes.trim(),
        createdAt: new Date().toISOString(),
      });
      cafeOperationsService.audit({
        module: "expenses",
        action: "EXPENSE_CREATED",
        description: `تم تسجيل مصروف ${form.category.trim()} بقيمة ${amount}`,
        entityType: "expense",
        entityId: expense.id,
      });
      setOpen(false);
      setForm(blank());
      window.dispatchEvent(new Event("operations:changed"));
      toast.success("تم تسجيل المصروف بنجاح.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر تسجيل المصروف.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <AdminModulePage
        section="المالية"
        title="المصروفات"
        description="سجل مصروفات الفرع الحالي حسب التصنيف والتاريخ."
        action="إضافة مصروف"
        onAdd={() => setOpen(true)}
      />
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) setForm(blank());
        }}
      >
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة مصروف</DialogTitle>
            <DialogDescription>
              سيتم ربط المصروف بالفرع الحالي تلقائيًا.
            </DialogDescription>
          </DialogHeader>
          <label className="text-sm font-semibold">
            التصنيف *
            <Input
              className="mt-1"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              القيمة *
              <Input
                className="mt-1"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
              />
            </label>
            <label className="text-sm font-semibold">
              التاريخ *
              <Input
                className="mt-1"
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <label className="text-sm font-semibold">
            ملاحظات
            <Input
              className="mt-1"
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
            />
          </label>
          <Button disabled={saving} onClick={save}>
            {saving ? "جارٍ الحفظ..." : "حفظ المصروف"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
