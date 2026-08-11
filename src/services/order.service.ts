import { cafeDataService } from "@/services/cafe-data.service";
import { cafeOperationsService } from "@/services/cafe-operations.service";
import { useAuthStore } from "@/store/auth.store";
import type { Order, OrderStatus } from "@/types/order.types";
import { restoreOrderInventory } from "@/services/inventory-reversal.service";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

const actorId = () =>
  useAuthStore.getState().user?.employeeId ?? useAuthStore.getState().user?.id;

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus) {
  return transitions[from].includes(to);
}

function saveOrder(order: Order) {
  const orders = cafeDataService.getOrders();
  if (!orders.some((item) => item.id === order.id))
    throw new Error("الطلب غير موجود في الفرع الحالي.");
  cafeDataService.saveOrders(
    orders.map((item) => (item.id === order.id ? order : item)),
  );
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("orders:changed"));
  return order;
}

export const orderService = {
  getOrders: () => cafeDataService.getOrders(),
  getById(orderId: string) {
    return cafeDataService.getOrders().find((order) => order.id === orderId);
  },
  transition(orderId: string, status: OrderStatus, note?: string) {
    const order = this.getById(orderId);
    if (!order) throw new Error("الطلب غير موجود في الفرع الحالي.");
    if (!canTransitionOrderStatus(order.status, status))
      throw new Error("لا يمكن نقل الطلب إلى هذه الحالة.");
    const timestamp = new Date().toISOString();
    const updated = saveOrder({
      ...order,
      status,
      updatedAt: timestamp,
      timeline: [
        ...(order.timeline ?? [{ status: order.status, at: order.createdAt }]),
        { status, employeeId: actorId(), at: timestamp, note },
      ],
    });
    cafeOperationsService.audit({
      module: "orders",
      action: "ORDER_STATUS_CHANGED",
      description: `تم تغيير حالة الطلب ${order.orderNumber} إلى ${status}`,
      entityType: "order",
      entityId: order.id,
    });
    return updated;
  },
  cancel(orderId: string, reason: string) {
    if (!reason.trim()) throw new Error("سبب إلغاء الطلب مطلوب.");
    const order = this.getById(orderId);
    if (!order) throw new Error("الطلب غير موجود في الفرع الحالي.");
    if (!canTransitionOrderStatus(order.status, "CANCELLED"))
      throw new Error("لا يمكن إلغاء الطلب في حالته الحالية.");
    const timestamp = new Date().toISOString();
    const inventoryResult = ["NEW", "ACCEPTED"].includes(order.status)
      ? restoreOrderInventory(order)
      : { restored: false, order };
    const updated = saveOrder({
      ...inventoryResult.order,
      status: "CANCELLED",
      updatedAt: timestamp,
      cancellation: {
        reason: reason.trim(),
        employeeId: actorId(),
        cancelledAt: timestamp,
      },
      timeline: [
        ...(order.timeline ?? [{ status: order.status, at: order.createdAt }]),
        {
          status: "CANCELLED",
          employeeId: actorId(),
          at: timestamp,
          note: reason.trim(),
        },
      ],
    });
    cafeOperationsService.audit({
      module: "orders",
      action: "ORDER_CANCELLED",
      description: `تم إلغاء الطلب ${order.orderNumber}: ${reason.trim()}`,
      entityType: "order",
      entityId: order.id,
    });
    return updated;
  },
};
