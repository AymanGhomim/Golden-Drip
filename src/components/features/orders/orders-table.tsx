import Link from "next/link";
import { Eye, XCircle } from "lucide-react";
import { PermissionGate } from "@/components/access/permission-gate";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/features/orders/order-badges";
import { SmartDataTable, type SmartColumn } from "@/components/shared/smart-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import type { Order } from "@/types/order.types";
import { orderSourceLabels, orderTypeLabels } from "@shared/presentation/order";

export function OrdersTable({ orders, onAdvance, onCancel }: {
  orders: Order[];
  onAdvance: (order: Order) => void;
  onCancel: (order: Order) => void;
}) {
  const actions = (order: Order) => (
    <div className="flex justify-end gap-1">
      <PermissionGate permission="orders.view">
        <Button asChild type="button" variant="outline" size="icon" className="h-8 w-8" aria-label="عرض التفاصيل">
          <Link href={`/admin/orders/${order.id}`}><Eye className="h-3.5 w-3.5" /></Link>
        </Button>
      </PermissionGate>
      <PermissionGate permission="orders.cancel">
        <Button type="button" className="h-8 rounded-md px-2 text-[11px]" onClick={() => onAdvance(order)} disabled={["COMPLETED", "CANCELLED"].includes(order.status)}>
          تحديث الحالة
        </Button>
        <Button type="button" variant="outline" size="icon" className="h-8 w-8 text-destructive" onClick={() => onCancel(order)} disabled={["COMPLETED", "CANCELLED"].includes(order.status)} aria-label="إلغاء">
          <XCircle className="h-3.5 w-3.5" />
        </Button>
      </PermissionGate>
    </div>
  );
  const columns: SmartColumn<Order>[] = [
    { key: "number", label: "رقم الطلب", hideable: false, sortValue: (order) => order.orderNumber, render: (order) => <span className="font-black">{order.orderNumber}</span> },
    { key: "source", label: "المصدر", sortValue: (order) => order.source ?? "", render: (order) => <Badge variant="outline">{orderSourceLabels[order.source ?? "MANUAL"]}</Badge> },
    { key: "type", label: "النوع", sortValue: (order) => order.orderType, render: (order) => orderTypeLabels[order.orderType] },
    { key: "customer", label: "العميل / الطاولة", sortValue: (order) => order.customerName ?? order.tableNumber, render: (order) => <div><b>{order.customerName || (order.orderType === "TABLE" ? `طاولة ${order.tableNumber}` : "عميل غير مسجل")}</b>{order.customerPhone ? <small className="mt-1 block text-muted-foreground">{order.customerPhone}</small> : null}</div> },
    { key: "items", label: "العناصر", sortValue: (order) => order.items.reduce((sum, item) => sum + item.quantity, 0), render: (order) => order.items.reduce((sum, item) => sum + item.quantity, 0) },
    { key: "total", label: "الإجمالي", sortValue: (order) => order.total, render: (order) => <span className="font-black">{formatMoney(order.total)}</span> },
    { key: "payment", label: "الدفع", sortValue: (order) => order.paymentStatus ?? "", render: (order) => <PaymentStatusBadge status={order.paymentStatus} /> },
    { key: "status", label: "حالة الطلب", sortValue: (order) => order.status, render: (order) => <OrderStatusBadge status={order.status} /> },
    { key: "time", label: "الوقت", sortValue: (order) => new Date(order.createdAt).getTime(), render: (order) => <span className="text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span> },
    { key: "actions", label: "الإجراءات", hideable: false, sticky: true, render: actions },
  ];

  return (
    <SmartDataTable
      data={orders}
      columns={columns}
      keyExtractor={(order) => order.id}
      storageKey="orders-smart-table"
      initialSort={{ key: "time", direction: "desc" }}
      emptyTitle="لا توجد طلبات مطابقة"
      emptyDescription="غيّر البحث أو الفلاتر الحالية لعرض نتائج أخرى."
      mobileCard={(order) => (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-black">{order.orderNumber}</p><p className="mt-1 text-xs text-muted-foreground">{order.customerName || (order.orderType === "TABLE" ? `طاولة ${order.tableNumber}` : orderTypeLabels[order.orderType])}</p></div>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="my-3 grid grid-cols-2 gap-2 rounded-xl bg-muted/45 p-3 text-xs">
              <div><span className="text-muted-foreground">الإجمالي</span><b className="mt-1 block text-sm">{formatMoney(order.total)}</b></div>
              <div><span className="text-muted-foreground">الدفع</span><div className="mt-1"><PaymentStatusBadge status={order.paymentStatus} /></div></div>
            </div>
            {actions(order)}
          </CardContent>
        </Card>
      )}
    />
  );
}
