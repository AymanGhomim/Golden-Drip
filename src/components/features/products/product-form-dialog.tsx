import {
  categoryNames,
  type ProductFormDraft,
  type ProductRow,
} from "@/components/features/products/product-model";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types/category.types";

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

export function ProductFormDialog({
  open,
  editing,
  form,
  categories,
  onOpenChange,
  onFormChange,
  onSave,
}: {
  open: boolean;
  editing: ProductRow | null;
  form: ProductFormDraft;
  categories: Category[];
  onOpenChange: (open: boolean) => void;
  onFormChange: (value: ProductFormDraft) => void;
  onSave: () => void;
}) {
  const change = (patch: Partial<ProductFormDraft>) =>
    onFormChange({ ...form, ...patch });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={(name) => change({ name })}
            />
            <Field
              label="SKU"
              value={form.sku}
              onChange={(sku) => change({ sku })}
            />
            <Field
              label="Barcode"
              value={form.barcode}
              onChange={(barcode) => change({ barcode })}
            />
            <label className="text-sm font-semibold">
              القسم
              <select
                value={form.categoryId}
                onChange={(event) => change({ categoryId: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm"
              >
                {categories.map((item) => (
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
              onChange={(event) => change({ description: event.target.value })}
              className="mt-1 h-10 rounded-lg"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              label="سعر البيع"
              value={form.price}
              onChange={(price) => change({ price })}
              type="number"
            />
            <Field
              label="التكلفة"
              value={form.cost}
              onChange={(cost) => change({ cost })}
              type="number"
            />
            <Field
              label="الضريبة %"
              value={form.tax}
              onChange={(tax) => change({ tax })}
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
          <Button type="button" className="h-11 rounded-lg" onClick={onSave}>
            حفظ المنتج
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
