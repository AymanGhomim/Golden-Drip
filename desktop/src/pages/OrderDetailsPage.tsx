import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  orderSourceLabels,
  orderStatusPresentation,
  orderTypeLabels,
  paymentMethodLabels,
  paymentStatusLabels,
} from "@shared/presentation/order";
import { OrderStatusBadge } from "@/components/features/orders/OrderStatusBadge";
import { Info, Page, Panel } from "@/components/shared/PageLayout";
import {
  formatDateTime,
  formatMoney,
  operationalOrderSequence,
} from "@/features/orders/order-presentation";
import { useAppDispatch, useAppSelector } from "@/store";
import { orderStatusChanged } from "@/store/orders-slice";

export function OrderDetailsPage() {
  const { orderId } = useParams();
  const order = useAppSelector((state) =>
    state.orders.items.find((item) => item.id === orderId),
  );
  const session = useAppSelector((state) => state.auth.session);
  const dispatch = useAppDispatch();
  if (!order)
    return (
      <Page>
        <Panel title="الطلب غير موجود">
          <Link className="underline" to="/orders">
            العودة إلى الطلبات
          </Link>
        </Panel>
      </Page>
    );
  const index = operationalOrderSequence.indexOf(order.status);
  const next =
    index >= 0 && index < operationalOrderSequence.length - 1
      ? operationalOrderSequence[index + 1]
      : null;
  return (
    <Page>
      <Link
        to="/orders"
        className="text-sm font-bold text-[var(--brand-primary)] underline"
      >
        العودة للطلبات
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-[var(--brand-accent)]">
            تفاصيل الطلب
          </p>
          <h1 className="mt-1 text-3xl font-black">{order.orderNumber}</h1>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="عناصر الطلب">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b border-[var(--brand-border)] py-3"
            >
              <div>
                <span>
                  <b>{item.quantity}×</b> {item.productName}
                </span>
                {item.notes ? (
                  <small className="mt-1 block text-[var(--brand-muted)]">
                    {item.notes}
                  </small>
                ) : null}
              </div>
              <b>{formatMoney(item.totalPrice)}</b>
            </div>
          ))}
          <div className="mt-4 space-y-2">
            <Info label="الإجمالي الفرعي" value={formatMoney(order.subtotal)} />
            <Info label="الخصم" value={formatMoney(order.discount ?? 0)} />
            <Info strong label="الإجمالي" value={formatMoney(order.total)} />
          </div>
        </Panel>
        <div className="space-y-5">
          <Panel title="معلومات الطلب">
            <Info
              label="الفرع"
              value={
                session?.accessibleBranches.find(
                  (branch) => branch.id === order.branchId,
                )?.name ?? "—"
              }
            />
            <Info label="نوع الطلب" value={orderTypeLabels[order.orderType]} />
            <Info
              label="المصدر"
              value={orderSourceLabels[order.source ?? "MANUAL"]}
            />
            <Info
              label="الطاولة"
              value={order.tableId ? `طاولة ${order.tableNumber}` : "—"}
            />
            <Info label="التاريخ" value={formatDateTime(order.createdAt)} />
          </Panel>
          <Panel title="بيانات العميل والدفع">
            <Info label="العميل" value={order.customerName ?? "عميل نقدي"} />
            <Info label="الهاتف" value={order.customerPhone ?? "—"} />
            <Info
              label="حالة الدفع"
              value={paymentStatusLabels[order.paymentStatus ?? "PENDING"]}
            />
            <Info
              label="طريقة الدفع"
              value={
                order.paymentMethod
                  ? paymentMethodLabels[order.paymentMethod]
                  : "—"
              }
            />
          </Panel>
        </div>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel title="الخط الزمني">
          {(order.timeline?.length
            ? order.timeline
            : [{ status: order.status, at: order.createdAt }]
          ).map((entry, entryIndex) => (
            <div
              key={`${entry.status}-${entryIndex}`}
              className="flex gap-3 border-b border-[var(--brand-border)] py-3 last:border-0"
            >
              <Clock3 className="mt-0.5 h-4 w-4 text-[var(--brand-accent)]" />
              <div>
                <b>{orderStatusPresentation[entry.status].label}</b>
                <small className="mt-1 block text-[var(--brand-muted)]">
                  {formatDateTime(entry.at)}
                </small>
              </div>
            </div>
          ))}
        </Panel>
        <Panel title="إجراءات التشغيل">
          {next && session?.permissions.includes("orders.update") ? (
            <button
              onClick={() =>
                dispatch(orderStatusChanged({ id: order.id, status: next }))
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-3 font-bold text-white"
            >
              <CheckCircle2 className="h-4 w-4" />
              تحويل إلى {orderStatusPresentation[next].label}
            </button>
          ) : (
            <p className="text-sm text-[var(--brand-muted)]">
              لا توجد انتقالات تشغيلية متاحة.
            </p>
          )}
          {!["COMPLETED", "CANCELLED", "REFUNDED"].includes(order.status) &&
          session?.permissions.includes("orders.cancel") ? (
            <button
              onClick={() =>
                dispatch(
                  orderStatusChanged({ id: order.id, status: "CANCELLED" }),
                )
              }
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-bold text-red-700"
            >
              <XCircle className="h-4 w-4" />
              إلغاء الطلب
            </button>
          ) : null}
        </Panel>
      </div>
    </Page>
  );
}
