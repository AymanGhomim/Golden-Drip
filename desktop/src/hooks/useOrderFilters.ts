import { useMemo, useState } from "react";
import {
  orderSourceLabels,
  orderStatusPresentation,
  orderTypeLabels,
  paymentStatusLabels,
} from "@shared/presentation/order";
import { operationalOrderSequence } from "@/features/orders/order-presentation";
import { useAppDispatch, useAppSelector } from "@/store";
import { orderStatusChanged } from "@/store/orders-slice";
import type { DesktopOrderStatus } from "@/types";

export function useOrderFilters() {
  const orders = useAppSelector((state) => state.orders.items);
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [source, setSource] = useState("ALL");
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          (!query ||
            `${order.orderNumber} ${order.customerName ?? ""} ${order.customerPhone ?? ""}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (status === "ALL" || order.status === status) &&
          (type === "ALL" || order.orderType === type) &&
          (source === "ALL" || order.source === source),
      ),
    [orders, query, source, status, type],
  );

  function advanceOrder(id: string, currentStatus: DesktopOrderStatus) {
    const index = operationalOrderSequence.indexOf(currentStatus);
    if (index >= 0 && index < operationalOrderSequence.length - 1) {
      dispatch(
        orderStatusChanged({ id, status: operationalOrderSequence[index + 1] }),
      );
    }
  }

  function cancelOrder(id: string) {
    dispatch(orderStatusChanged({ id, status: "CANCELLED" }));
  }

  function exportOrders() {
    const rows = filteredOrders.map((order) => [
      order.orderNumber,
      order.createdAt,
      orderSourceLabels[order.source ?? "MANUAL"],
      orderTypeLabels[order.orderType],
      order.total,
      paymentStatusLabels[order.paymentStatus ?? "PENDING"],
      orderStatusPresentation[order.status].label,
    ]);
    const escape = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;
    const csv = `\uFEFF${[["رقم الطلب", "التاريخ", "المصدر", "النوع", "الإجمالي", "الدفع", "الحالة"], ...rows].map((row) => row.map(escape).join(",")).join("\n")}`;
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return {
    advanceOrder,
    cancelOrder,
    exportOrders,
    filteredOrders,
    orders,
    query,
    setQuery,
    setSource,
    setStatus,
    setType,
    source,
    status,
    type,
  };
}
