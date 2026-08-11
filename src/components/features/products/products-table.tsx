import Image from "next/image";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { PermissionGate } from "@/components/access/permission-gate";
import {
  categoryNames,
  productNames,
  type ProductRow,
} from "@/components/features/products/product-model";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PaginationState } from "@/hooks/use-pagination";
import { formatMoney } from "@/lib/money";

export function ProductsTable({
  products,
  pagination,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  products: ProductRow[];
  pagination: {
    state: PaginationState;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
  };
  onEdit: (product: ProductRow) => void;
  onDuplicate: (product: ProductRow) => void;
  onDelete: (product: ProductRow) => void;
}) {
  return (
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
          {products.map((product) => (
            <tr key={product.id} className="border-t">
              <td className="px-4 py-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={productNames[product.id] ?? product.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-3 font-bold">
                {productNames[product.id] ?? product.name}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {categoryNames[product.categoryId]}
              </td>
              <td className="px-4 py-3 font-bold">
                {formatMoney(product.price)}
              </td>
              <td className="px-4 py-3">{formatMoney(product.cost)}</td>
              <td className="px-4 py-3">
                <span
                  className={product.stock < 5 ? "font-bold text-red-700" : ""}
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
                  <PermissionGate permission="products.update">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(product)}
                      aria-label="تعديل"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </PermissionGate>
                  <PermissionGate permission="products.create">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDuplicate(product)}
                      aria-label="نسخ"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </PermissionGate>
                  <PermissionGate permission="products.delete">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => onDelete(product)}
                      aria-label="حذف"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </PermissionGate>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!pagination.state.total ? (
        <EmptyState
          title="لا توجد منتجات حتى الآن"
          description="أضف منتجًا جديدًا أو غيّر البحث والفلاتر الحالية."
          icon="package"
        />
      ) : null}
      <Pagination
        {...pagination.state}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}
