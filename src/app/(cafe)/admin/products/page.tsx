"use client";

import { Copy, Download, Eye, Plus } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { PermissionGate } from "@/components/access/permission-gate";
import { ProductFormDialog } from "@/components/features/products/product-form-dialog";
import { ProductsFilters } from "@/components/features/products/products-filters";
import { ProductsTable } from "@/components/features/products/products-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProductsPage } from "@/hooks/use-products-page";

export default function ProductsPage() {
  const controller = useProductsPage();
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
            <PermissionGate permission="products.view">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg"
                disabled={!controller.products.length}
                onClick={controller.exportProducts}
              >
                <Download className="ml-2 h-4 w-4" />
                تصدير
              </Button>
            </PermissionGate>
            <Button
              type="button"
              className="h-10 rounded-lg"
              onClick={() => controller.openForm()}
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة منتج
            </Button>
          </div>
        </div>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            label="إجمالي المنتجات"
            value={controller.products.length}
            icon={Eye}
          />
          <AdminStatCard
            label="المنتجات المتاحة"
            value={
              controller.products.filter((product) => product.isAvailable)
                .length
            }
            icon={Eye}
          />
          <AdminStatCard
            label="غير المتاحة"
            value={
              controller.products.filter((product) => !product.isAvailable)
                .length
            }
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
            <ProductsFilters
              query={controller.query}
              category={controller.category}
              availability={controller.availability}
              categories={controller.categories}
              onQueryChange={controller.setQuery}
              onCategoryChange={controller.setCategory}
              onAvailabilityChange={controller.setAvailability}
            />
            <ProductsTable
              products={controller.pagination.items}
              pagination={controller.pagination}
              onEdit={controller.openForm}
              onDuplicate={controller.duplicateProduct}
              onDelete={controller.setDeleteTarget}
            />
          </CardContent>
        </Card>
        <ProductFormDialog
          open={controller.formOpen}
          editing={controller.editing}
          form={controller.form}
          categories={controller.categories}
          onOpenChange={controller.setFormOpen}
          onFormChange={controller.setForm}
          onSave={controller.saveProduct}
        />
        <ConfirmDialog
          open={Boolean(controller.deleteTarget)}
          onOpenChange={(open) => !open && controller.setDeleteTarget(null)}
          title="حذف المنتج؟"
          description="سيتم حذف المنتج من المنيوهات المرتبطة به. لا يمكن التراجع عن هذا الإجراء داخل النسخة الحالية."
          confirmLabel="حذف"
          onConfirm={controller.removeProduct}
        />
      </section>
    </AdminShell>
  );
}
