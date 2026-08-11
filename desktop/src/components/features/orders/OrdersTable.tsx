import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  orderSourceLabels,
  orderTypeLabels,
  paymentStatusLabels,
} from "@shared/presentation/order";
import { OrderStatusBadge } from "@/components/features/orders/OrderStatusBadge";
import { Empty } from "@/components/shared/PageLayout";
import {
  formatDateTime,
  formatMoney,
  operationalOrderSequence,
} from "@/features/orders/order-presentation";
import type { useOrderFilters } from "@/hooks/useOrderFilters";

type Filters = ReturnType<typeof useOrderFilters>;

export function OrdersTable({
  advanceOrder,
  cancelOrder,
  filteredOrders,
  orders,
}: Pick<
  Filters,
  "advanceOrder" | "cancelOrder" | "filteredOrders" | "orders"
>) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] text-right text-sm">
          <thead className="bg-black/5">
            <tr>
              {[
                "رقم الطلب",
                "العميل / الطاولة",
                "المصدر",
                "النوع",
                "الدفع",
                "الحالة",
                "الإجمالي",
                "الإجراءات",
              ].map((heading) => (
                <th key={heading}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-[var(--brand-border)]"
              >
                <td className="font-black">
                  {order.orderNumber}
                  <small className="mt-1 block font-normal text-[var(--brand-muted)]">
                    {formatDateTime(order.createdAt)}
                  </small>
                </td>
                <td>
                  {order.customerName ||
                    (order.orderType === "TABLE"
                      ? `طاولة ${order.tableNumber}`
                      : "عميل نقدي")}
                </td>
                <td>{orderSourceLabels[order.source ?? "MANUAL"]}</td>
                <td>{orderTypeLabels[order.orderType]}</td>
                <td>{paymentStatusLabels[order.paymentStatus ?? "PENDING"]}</td>
                <td>
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="font-bold">{formatMoney(order.total)}</td>
                <td>
                  <div className="flex gap-2">
                    <Link
                      className="icon-button"
                      title="التفاصيل"
                      to={`/orders/${order.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    {operationalOrderSequence.includes(order.status) &&
                    order.status !== "COMPLETED" ? (
                      <button
                        className="icon-button"
                        title="الحالة التالية"
                        onClick={() => advanceOrder(order.id, order.status)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    ) : null}
                    {!["COMPLETED", "CANCELLED", "REFUNDED"].includes(
                      order.status,
                    ) ? (
                      <button
                        className="icon-button text-red-600"
                        title="إلغاء"
                        onClick={() => cancelOrder(order.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filteredOrders.length ? (
        <Empty>لا توجد طلبات مطابقة للفلاتر الحالية.</Empty>
      ) : null}
      <div className="flex items-center justify-between border-t border-[var(--brand-border)] p-4 text-sm text-[var(--brand-muted)]">
        <span>
          عرض {filteredOrders.length} من {orders.length}
        </span>
        <span>صفحة ١ من ١</span>
      </div>
    </>
  );
}
