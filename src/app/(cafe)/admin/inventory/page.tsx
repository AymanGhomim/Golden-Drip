"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Boxes, PackageX, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { PermissionGate } from "@/components/access/permission-gate";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
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
import type { InventoryItem } from "@/types/cafe-operations.types";

const blank = {
  name: "",
  sku: "",
  unit: "كجم",
  quantity: "0",
  minimumStock: "0",
  averageCost: "0",
};
const itemStatus = (item: InventoryItem) =>
  item.quantity <= 0
    ? "نفد من المخزون"
    : item.quantity <= item.minimumStock
      ? "مخزون منخفض"
      : "جيد";

export default function InventoryPage() {
  const { tenant } = useTenant();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [target, setTarget] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(blank);
  const reload = () =>
    setItems(cafeOperationsService.get<InventoryItem>("inventory"));
  useEffect(() => {
    reload();
    const handler = () => {
      setOpen(false);
      setTarget(null);
      setForm(blank);
      reload();
    };
    window.addEventListener("tenant:changed", handler);
    window.addEventListener("branch:changed", handler);
    return () => {
      window.removeEventListener("tenant:changed", handler);
      window.removeEventListener("branch:changed", handler);
    };
  }, []);
  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          item.active &&
          `${item.name} ${item.sku ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [items, query],
  );
  const money = (value: number) =>
    formatMoney(value, tenant.settings.currencySymbol);
  function save() {
    const quantity = Number(form.quantity);
    const minimumStock = Number(form.minimumStock);
    const averageCost = Number(form.averageCost);
    if (!form.name.trim() || !form.unit.trim())
      return toast.error("اسم العنصر والوحدة مطلوبان.");
    if (
      ![quantity, minimumStock, averageCost].every(Number.isFinite) ||
      quantity < 0 ||
      minimumStock < 0 ||
      averageCost < 0
    )
      return toast.error("قيم الكمية والتكلفة يجب أن تكون أرقامًا غير سالبة.");
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const item = cafeOperationsService.create<InventoryItem>("inventory", {
        name: form.name.trim(),
        sku: form.sku.trim(),
        unit: form.unit.trim(),
        quantity,
        minimumStock,
        averageCost,
        active: true,
        createdAt: now,
        updatedAt: now,
      });
      cafeOperationsService.audit({
        module: "inventory",
        action: "INVENTORY_ITEM_CREATED",
        description: `تمت إضافة عنصر المخزون ${item.name}`,
        entityType: "inventoryItem",
        entityId: item.id,
      });
      setOpen(false);
      setForm(blank);
      reload();
      toast.success("تمت إضافة عنصر المخزون بنجاح.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حفظ العنصر.");
    } finally {
      setSaving(false);
    }
  }
  function disableTarget() {
    if (!target) return;
    const next = items.map((item) =>
      item.id === target.id
        ? { ...item, active: false, updatedAt: new Date().toISOString() }
        : item,
    );
    cafeOperationsService.save("inventory", next);
    cafeOperationsService.audit({
      module: "inventory",
      action: "INVENTORY_ITEM_DISABLED",
      description: `تم تعطيل عنصر المخزون ${target.name}`,
      entityType: "inventoryItem",
      entityId: target.id,
    });
    setTarget(null);
    reload();
    toast.success("تم تعطيل العنصر.");
  }
  return (
    <AdminShell>
      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5"
      >
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-accent">المخزون</p>
            <h1 className="mt-1 text-2xl font-black">المخزون</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              إدارة مخزون الفرع الحالي وتكاليفه.
            </p>
          </div>
          <PermissionGate permission="inventory.create"><Button onClick={() => setOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة عنصر
          </Button></PermissionGate>
        </div>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            label="قيمة المخزون"
            value={money(
              items.reduce(
                (sum, item) => sum + item.quantity * item.averageCost,
                0,
              ),
            )}
            icon={Boxes}
          />
          <AdminStatCard
            label="عدد العناصر"
            value={visible.length}
            icon={Boxes}
          />
          <AdminStatCard
            label="مخزون منخفض"
            value={
              visible.filter((item) => itemStatus(item) === "مخزون منخفض")
                .length
            }
            icon={AlertTriangle}
          />
          <AdminStatCard
            label="نفد من المخزون"
            value={
              visible.filter((item) => itemStatus(item) === "نفد من المخزون")
                .length
            }
            icon={PackageX}
          />
        </div>
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="بحث عن عنصر"
            className="pr-9"
          />
        </div>
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[850px] text-right text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {[
                    "العنصر",
                    "الكمية",
                    "الوحدة",
                    "الحد الأدنى",
                    "متوسط التكلفة",
                    "القيمة",
                    "الحالة",
                    "الإجراءات",
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-3">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3 font-bold">{item.name}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{item.unit}</td>
                    <td className="px-4 py-3">{item.minimumStock}</td>
                    <td className="px-4 py-3">{money(item.averageCost)}</td>
                    <td className="px-4 py-3">
                      {money(item.quantity * item.averageCost)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{itemStatus(item)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <PermissionGate permission="inventory.adjust"><Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setTarget(item)}
                      >
                        تعطيل
                      </Button></PermissionGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visible.length ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                لا توجد عناصر مطابقة في مخزون الفرع الحالي.
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent dir="rtl" className="max-w-xl">
            <DialogHeader>
              <DialogTitle>إضافة عنصر مخزون</DialogTitle>
              <DialogDescription>
                أدخل الرصيد الافتتاحي وتكلفة الوحدة في الفرع الحالي.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["name", "الاسم *", "text"],
                  ["sku", "SKU", "text"],
                  ["unit", "الوحدة *", "text"],
                  ["quantity", "الكمية الافتتاحية", "number"],
                  ["minimumStock", "الحد الأدنى", "number"],
                  ["averageCost", "متوسط تكلفة الوحدة", "number"],
                ] as const
              ).map(([key, label, type]) => (
                <label key={key} className="text-sm font-semibold">
                  {label}
                  <Input
                    className="mt-1"
                    type={type}
                    min={type === "number" ? 0 : undefined}
                    step={type === "number" ? "0.01" : undefined}
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
            </div>
            <Button disabled={saving} onClick={save}>
              {saving ? "جارٍ الحفظ..." : "حفظ العنصر"}
            </Button>
          </DialogContent>
        </Dialog>
        <ConfirmDialog
          open={Boolean(target)}
          onOpenChange={(value) => !value && setTarget(null)}
          title="تعطيل عنصر المخزون؟"
          description="سيختفي العنصر من العمليات الجديدة، ولن تُحذف حركاته السابقة."
          confirmLabel="تعطيل"
          onConfirm={disableTarget}
        />
      </section>
    </AdminShell>
  );
}
