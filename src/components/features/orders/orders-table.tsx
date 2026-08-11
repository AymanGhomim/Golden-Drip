import Link from "next/link";
import { Eye, XCircle } from "lucide-react";
import { PermissionGate } from "@/components/access/permission-gate";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/features/orders/order-badges";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PaginationState } from "@/hooks/use-pagination";
import { formatMoney } from "@/lib/money";
import type { Order } from "@/types/order.types";
import { orderSourceLabels, orderTypeLabels } from "@shared/presentation/order";

export function OrdersTable({
  orders,
  pagination,
  onAdvance,
  onCancel,
}: {
  orders: Order[];
  pagination: {
    state: PaginationState;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
  };
  onAdvance: (order: Order) => void;
  onCancel: (order: Order) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] text-right text-xs">
        <thead className="bg-muted/50 text-[11px] text-muted-foreground">
          <tr>
            {[
              "رقم الطلب",
              "المصدر",
              "النوع",
              "العميل / الطاولة",
              "العناصر",
              "الإجمالي",
              "حالة الدفع",
              "حالة الطلب",
              "الوقت",
              "الإجراءات",
            ].map((heading) => (
              <th key={heading} className="px-3 py-3 font-bold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t align-middle">
              <td className="px-3 py-3 font-black">{order.orderNumber}</td>
              <td className="px-3 py-3">
                <Badge variant="outline">
                  {orderSourceLabels[order.source ?? "MANUAL"]}
                </Badge>
              </td>
              <td className="px-3 py-3">{orderTypeLabels[order.orderType]}</td>
              <td className="px-3 py-3">
                <b>
                  {order.customerName ||
                    (order.orderType === "TABLE"
                      ? `طاولة ${order.tableNumber}`
                      : "عميل غير مسجل")}
                </b>
                {order.customerPhone ? (
                  <small className="mt-1 block text-muted-foreground">
                    {order.customerPhone}
                  </small>
                ) : null}
              </td>
              <td className="px-3 py-3">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </td>
              <td className="px-3 py-3 font-black">
                {formatMoney(order.total)}
              </td>
              <td className="px-3 py-3">
                <PaymentStatusBadge status={order.paymentStatus} />
              </td>
              <td className="px-3 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-3 py-3 text-muted-foreground">
                {new Date(order.createdAt).toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-3 py-3">
                <div className="flex gap-1">
                  <PermissionGate permission="orders.view">
                    <Button
                      asChild
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="عرض التفاصيل"
                    >
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </PermissionGate>
                  <PermissionGate permission="orders.cancel">
                    <Button
                      type="button"
                      className="h-8 rounded-md px-2 text-[11px]"
                      onClick={() => onAdvance(order)}
                      disabled={
                        order.status === "COMPLETED" ||
                        order.status === "CANCELLED"
                      }
                    >
                      تحديث الحالة
                    </Button>
                  </PermissionGate>
                  <PermissionGate permission="orders.cancel">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => onCancel(order)}
                      disabled={
                        order.status === "COMPLETED" ||
                        order.status === "CANCELLED"
                      }
                      aria-label="إلغاء"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </Button>
                  </PermissionGate>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!pagination.state.total ? (
        <div className="p-12 text-center text-sm text-muted-foreground">
          لا توجد طلبات مطابقة للفلاتر الحالية.
        </div>
      ) : null}
      <Pagination
        {...pagination.state}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}
