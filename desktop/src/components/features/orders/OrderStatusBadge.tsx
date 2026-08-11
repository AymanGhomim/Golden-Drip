import { orderStatusPresentation } from "@shared/presentation/order";
import type { DesktopOrderStatus } from "@/types";

const statusStyles: Record<DesktopOrderStatus, string> = {
  NEW: "bg-sky-100 text-sky-700",
  ACCEPTED: "bg-indigo-100 text-indigo-700",
  PREPARING: "bg-amber-100 text-amber-800",
  READY: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-stone-100 text-stone-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-red-100 text-red-700",
};

export function OrderStatusBadge({ status }: { status: DesktopOrderStatus }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status]}`}
    >
      {orderStatusPresentation[status].label}
    </span>
  );
}
