"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Download,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
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
import { cafeDataService } from "@/services/cafe-data.service";
import { cafeOperationsService } from "@/services/cafe-operations.service";
import type { Category } from "@/types/category.types";
import type { Product } from "@/types/product.types";

type ProductRow = Product & {
  cost: number;
  stock: number;
  online: boolean;
  pos: boolean;
};
const categoryNames: Record<string, string> = {
  "cat-1": "القهوة الساخنة",
  "cat-2": "القهوة الباردة",
  "cat-3": "الشاي والماتشا",
  "cat-4": "المشروبات المنعشة",
  "cat-5": "الفراپيه والسموذي",
  "cat-6": "العروض الخاصة",
};
const names: Record<string, string> = {
  "prod-1": "إسبريسو",
  "prod-2": "أمريكانو",
  "prod-3": "كابتشينو",
  "prod-4": "فلات وايت",
  "prod-5": "آيس لاتيه",
  "prod-6": "سبانيش آيس لاتيه",
  "prod-7": "آيس كراميل ماكياتو",
  "prod-8": "كولد برو",
  "prod-9": "ماتشا لاتيه",
  "prod-10": "آيس ماتشا",
  "prod-11": "شاي بالنعناع",
  "prod-12": "تشاي لاتيه",
  "prod-13": "ليمون بالنعناع",
  "prod-14": "مانجو باشن",
  "prod-15": "موهيتو فراولة",
  "prod-16": "فرابيه كراميل",
  "prod-17": "فرابيه شوكولاتة",
  "prod-18": "سموذي توت",
  "prod-19": "جولدن دريب سيجنتشر",
  "prod-20": "هوت شوكولاتة",
};
const money = (value: number) => `${value.toLocaleString("ar-EG")} ج.م`;
const toRows = (items: Product[]) =>
  items.map((product, index) => ({
    ...product,
    cost: Math.round(product.price * 0.55),
    stock: index % 7 === 0 ? 3 : 20 + index,
    online: true,
    pos: true,
  }));

export default function ProductsPage() {
  const reload = () => {
    setProducts(toRows(cafeDataService.getProducts()));
    setCategoriesList(cafeDataService.getCategories());
  };
  useEffect(() => {
    reload();
    const handler = () => reload();
    window.addEventListener("tenant:changed", handler);
    return () => window.removeEventListener("tenant:changed", handler);
  }, []);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [availability, setAvailability] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    sku: "",
    barcode: "",
    categoryId: "cat-1",
    price: "",
    cost: "",
    tax: "14",
  });
  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (!query ||
            `${product.name} ${names[product.id] ?? ""}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (category === "ALL" || product.categoryId === category) &&
          (availability === "ALL" ||
            (availability === "ONLINE" && product.online) ||
            (availability === "POS" && product.pos) ||
            (availability === "UNAVAILABLE" && !product.isAvailable)),
      ),
    [availability, category, products, query],
  );
  function start(product?: ProductRow) {
    setEditing(product ?? null);
    setForm({
      name: product ? (names[product.id] ?? product.name) : "",
      description: product?.description ?? "",
      sku: product?.id ?? `SKU-${products.length + 1}`,
      barcode: "",
      categoryId: product?.categoryId ?? "cat-1",
      price: product ? String(product.price) : "",
      cost: product ? String(product.cost) : "",
      tax: "14",
    });
    setOpen(true);
  }
  function save() {
    const price = Number(form.price);
    if (!form.name.trim()) return toast.error("اسم المنتج مطلوب.");
    if (!Number.isFinite(price) || price < 0)
      return toast.error("سعر البيع غير صحيح.");
    const data = {
      name: form.name.trim(),
      description: form.description,
      price,
      categoryId: form.categoryId,
      image: editing?.image,
      isAvailable: true,
      id: editing?.id ?? `prod-${Date.now()}`,
      cost: Number(form.cost) || 0,
      stock: editing?.stock ?? 0,
      online: true,
      pos: true,
    };
    setProducts((current) => {
      const next = editing
        ? current.map((product) =>
            product.id === editing.id ? { ...product, ...data } : product,
          )
        : [data, ...current];
      cafeDataService.saveProducts(next);
      return next;
    });
    setOpen(false);
    toast.success("تم حفظ المنتج");
  }
  function removeProduct() {
    if (!deleteTarget) return;
    const next = products.filter((item) => item.id !== deleteTarget.id);
    cafeDataService.saveProducts(next);
    setProducts(next);
    cafeOperationsService.audit({
      module: "products",
      action: "PRODUCT_DELETED",
      description: `تم حذف المنتج ${deleteTarget.name}`,
      entityType: "product",
      entityId: deleteTarget.id,
    });
    setDeleteTarget(null);
    toast.success("تم حذف المنتج.");
  }
  return (
    <AdminShell>
      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5"
      >
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold text-accent">إدارة المنيو</p>
            <h1 className="mt-1 text-2xl font-black">المنتجات</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              إدارة المنتجات والأسعار والتوفر في POS والمنيو الإلكتروني.
            </p>
          </div>
          <div className="flex gap-2">
            <PermissionGate permission="products.create"><Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg"
              disabled
              title="التصدير يحتاج موصل ملفات وسيتم توفيره لاحقًا"
            >
              <Download className="ml-2 h-4 w-4" />
              تصدير
            </Button></PermissionGate>
            <Button
              type="button"
              className="h-10 rounded-lg"
              onClick={() => start()}
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة منتج
            </Button>
          </div>
        </div>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            label="إجمالي المنتجات"
            value={products.length}
            icon={Eye}
          />
          <AdminStatCard
            label="المنتجات المتاحة"
            value={products.filter((product) => product.isAvailable).length}
            icon={Eye}
          />
          <AdminStatCard
            label="غير المتاحة"
            value={products.filter((product) => !product.isAvailable).length}
            icon={Eye}
          />
          <AdminStatCard
            label="الأكثر مبيعًا"
            value="سبانيش آيس لاتيه"
            icon={Copy}
          />
        </div>
        <Card className="overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b p-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="بحث باسم المنتج"
                  className="h-10 rounded-lg pr-9"
                />
              </div>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-10 rounded-lg border bg-background px-3 text-sm"
              >
                <option value="ALL">كل الأقسام</option>
                {categoriesList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {categoryNames[item.id]}
                  </option>
                ))}
              </select>
              <select
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
                className="h-10 rounded-lg border bg-background px-3 text-sm"
              >
                <option value="ALL">كل الحالات</option>
                <option value="ONLINE">متاح أونلاين</option>
                <option value="POS">متاح POS</option>
                <option value="UNAVAILABLE">غير متاح</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-right text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    {[
                      "الصورة",
                      "الاسم",
                      "القسم",
                      "السعر",
                      "التكلفة",
                      "المخزون",
                      "الحالة",
                      "الإجراءات",
                    ].map((heading) => (
                      <th key={heading} className="px-4 py-3 font-bold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-muted">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={names[product.id] ?? product.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {names[product.id] ?? product.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {categoryNames[product.categoryId]}
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {money(product.price)}
                      </td>
                      <td className="px-4 py-3">{money(product.cost)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            product.stock < 5 ? "font-bold text-red-700" : ""
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Badge
                            className={
                              product.isAvailable
                                ? "bg-emerald-500/15 text-emerald-700"
                                : "bg-red-500/15 text-red-700"
                            }
                          >
                            {product.isAvailable ? "نشط" : "غير نشط"}
                          </Badge>
                          {product.online ? (
                            <Badge variant="outline">أونلاين</Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <PermissionGate permission="products.update"><Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => start(product)}
                            aria-label="تعديل"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button></PermissionGate>
                          <PermissionGate permission="products.create"><Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              setProducts((current) => {
                                const next = [
                                  ...current,
                                  { ...product, id: `${product.id}-copy` },
                                ];
                                cafeDataService.saveProducts(next);
                                return next;
                              })
                            }
                            aria-label="نسخ"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button></PermissionGate>
                          <PermissionGate permission="products.delete"><Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeleteTarget(product)}
                            aria-label="حذف"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button></PermissionGate>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            dir="rtl"
            className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl"
          >
            <DialogHeader>
              <DialogTitle>{editing ? "تعديل منتج" : "إضافة منتج"}</DialogTitle>
              <DialogDescription>
                البيانات الأساسية والبيع والمخزون والخيارات.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="الاسم بالعربي"
                  value={form.name}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, name: value }))
                  }
                />
                <Field
                  label="SKU"
                  value={form.sku}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, sku: value }))
                  }
                />
                <Field
                  label="Barcode"
                  value={form.barcode}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, barcode: value }))
                  }
                />
                <label className="text-sm font-semibold">
                  القسم
                  <select
                    value={form.categoryId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        categoryId: event.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm"
                  >
                    {categoriesList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {categoryNames[item.id]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="text-sm font-semibold">
                الوصف
                <Input
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="mt-1 h-10 rounded-lg"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field
                  label="سعر البيع"
                  value={form.price}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, price: value }))
                  }
                  type="number"
                />
                <Field
                  label="التكلفة"
                  value={form.cost}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, cost: value }))
                  }
                  type="number"
                />
                <Field
                  label="الضريبة %"
                  value={form.tax}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, tax: value }))
                  }
                  type="number"
                />
              </div>
              <div className="grid gap-2 rounded-lg border p-3 text-sm">
                <b>البيع والقنوات</b>
                <label>
                  <input type="checkbox" defaultChecked className="ml-2" />
                  متاح في POS
                </label>
                <label>
                  <input type="checkbox" defaultChecked className="ml-2" />
                  متاح في المنيو الإلكتروني
                </label>
                <label>
                  <input type="checkbox" className="ml-2" />
                  يتتبع مخزون
                </label>
                <label>
                  <input type="checkbox" className="ml-2" />
                  مرتبط بوصفة
                </label>
              </div>
              <div className="grid gap-2 rounded-lg border p-3 text-sm">
                <b>الخيارات</b>
                <label>
                  <input type="checkbox" className="ml-2" />
                  Variants
                </label>
                <label>
                  <input type="checkbox" className="ml-2" />
                  Add-ons
                </label>
              </div>
              <Button type="button" className="h-11 rounded-lg" onClick={save}>
                حفظ المنتج
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(value) => !value && setDeleteTarget(null)}
          title="حذف المنتج؟"
          description="سيتم حذف المنتج من المنيوهات المرتبطة به. لا يمكن التراجع عن هذا الإجراء داخل النسخة الحالية."
          confirmLabel="حذف"
          onConfirm={removeProduct}
        />
      </section>
    </AdminShell>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 rounded-lg"
      />
    </label>
  );
}
