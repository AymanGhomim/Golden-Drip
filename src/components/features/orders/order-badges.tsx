import { Badge } from "@/components/ui/badge";
import {
  orderStatusPresentation,
  paymentStatusLabels,
} from "@shared/presentation/order";
import type { OrderStatus, PaymentStatus } from "@/types/order.types";

const orderStyles: Record<OrderStatus, string> = {
  NEW: "bg-sky-500/15 text-sky-700",
  ACCEPTED: "bg-indigo-500/15 text-indigo-700",
  PREPARING: "bg-amber-500/15 text-amber-700",
  READY: "bg-emerald-500/15 text-emerald-700",
  COMPLETED: "bg-stone-500/15 text-stone-700",
  CANCELLED: "bg-red-500/15 text-red-700",
  REFUNDED: "bg-red-500/15 text-red-700",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={orderStyles[status]}>
      {orderStatusPresentation[status].label}
    </Badge>
  );
}

export function PaymentStatusBadge({
  status = "PENDING",
}: {
  status?: PaymentStatus;
}) {
  const style =
    status === "PAID"
      ? "bg-emerald-500/15 text-emerald-700"
      : status === "FAILED"
        ? "bg-red-500/15 text-red-700"
        : "bg-amber-500/15 text-amber-700";
  return <Badge className={style}>{paymentStatusLabels[status]}</Badge>;
}
