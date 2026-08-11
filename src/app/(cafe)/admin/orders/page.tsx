"use client";

import Link from "next/link";
import { Download, Plus, RefreshCw } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { PermissionGate } from "@/components/access/permission-gate";
import { OrderCancellationDialog } from "@/components/features/orders/order-cancellation-dialog";
import { OrdersFilters } from "@/components/features/orders/orders-filters";
import { OrdersTable } from "@/components/features/orders/orders-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOrdersPage } from "@/hooks/use-orders-page";

export default function OrdersPage() {
  const controller = useOrdersPage();
  return (
    <AdminShell>
      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5"
      >
        <div className="mb-4 flex flex-col justify-between gap-3 rounded-xl border bg-card p-5 shadow-sm lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold text-accent">المبيعات</p>
            <h1 className="mt-1 text-2xl font-black">الطلبات</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              كل الطلبات في نظام موحد: نقطة البيع وQR والمنيو الإلكتروني والطلب
              اليدوي.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PermissionGate permission="orders.create">
              <Button asChild className="h-10 rounded-lg">
                <Link href="/admin/pos?source=manual">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة طلب يدوي
                </Link>
              </Button>
            </PermissionGate>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg"
              onClick={controller.refresh}
            >
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg"
              disabled={!controller.filteredOrders.length}
              onClick={controller.exportOrders}
            >
              <Download className="ml-2 h-4 w-4" />
              تصدير
            </Button>
          </div>
        </div>
        <Card className="overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <OrdersFilters {...controller} />
            <OrdersTable
              orders={controller.pagination.items}
              pagination={controller.pagination}
              onAdvance={controller.advanceOrder}
              onCancel={controller.openCancellation}
            />
          </CardContent>
        </Card>
        <OrderCancellationDialog
          order={controller.cancelTarget}
          reason={controller.cancelReason}
          confirmOpen={controller.cancelConfirmOpen}
          onOrderChange={controller.setCancelTarget}
          onReasonChange={controller.setCancelReason}
          onConfirmOpenChange={controller.setCancelConfirmOpen}
          onConfirm={controller.confirmCancellation}
        />
      </section>
    </AdminShell>
  );
}
