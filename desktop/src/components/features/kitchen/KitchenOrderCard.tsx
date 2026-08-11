import { Clock3 } from "lucide-react";
import { orderTypeLabels } from "@shared/presentation/order";
import { OrderStatusBadge } from "@/components/features/orders/OrderStatusBadge";
import { Panel } from "@/components/shared/PageLayout";
import type { DesktopOrder } from "@/types";

export function KitchenOrderCard({
  order,
  action,
  onAction,
  canUpdate,
}: {
  order: DesktopOrder;
  action: string;
  onAction: () => void;
  canUpdate: boolean;
}) {
  const minutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000),
  );
  const late = minutes >= 30 && order.status !== "READY";
  return (
    <Panel className={late ? "border-2 border-red-400" : ""} title="">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-black">{order.orderNumber}</h3>
          <p className="mt-1 text-xs text-[var(--brand-muted)]">
            {order.orderType === "TABLE"
              ? `داخل الكافيه · طاولة ${order.tableNumber}`
              : orderTypeLabels[order.orderType]}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-[var(--brand-muted)]">
        <Clock3 className="h-3.5 w-3.5" />
        منذ {minutes} دقيقة
      </div>
      <div className="my-3 space-y-2 border-y border-[var(--brand-border)] py-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-2 text-sm">
            <span>
              <b>{item.quantity}×</b> {item.productName}
            </span>
            <small>{item.notes}</small>
          </div>
        ))}
      </div>
      {canUpdate ? (
        <button
          className="w-full rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 font-bold text-white"
          onClick={onAction}
        >
          {action}
        </button>
      ) : null}
    </Panel>
  );
}
