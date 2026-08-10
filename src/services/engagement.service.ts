import { cafeOperationsService } from "@/services/cafe-operations.service";
import { useAuthStore } from "@/store/auth.store";
import type {
  NotificationRecord,
  WaiterRequest,
} from "@/types/cafe-operations.types";

const actorId = () =>
  useAuthStore.getState().user?.employeeId ?? useAuthStore.getState().user?.id;
const changed = () =>
  typeof window !== "undefined" &&
  window.dispatchEvent(new Event("operations:changed"));

export const engagementService = {
  getWaiterRequests: () =>
    cafeOperationsService.get<WaiterRequest>("waiterRequests"),
  createWaiterRequest(
    value: Omit<
      WaiterRequest,
      "id" | "tenantId" | "branchId" | "status" | "createdAt"
    >,
  ) {
    const request = cafeOperationsService.create<WaiterRequest>(
      "waiterRequests",
      { ...value, status: "NEW", createdAt: new Date().toISOString() },
    );
    cafeOperationsService.create<NotificationRecord>("notifications", {
      type: value.type === "BILL" ? "BILL_REQUEST" : "WAITER_REQUEST",
      title: value.type === "BILL" ? "طلب حساب جديد" : "طلب خدمة جديد",
      message: `طاولة ${value.tableNumber ?? value.tableId}`,
      read: false,
      relatedEntityType: "waiterRequest",
      relatedEntityId: request.id,
      createdAt: request.createdAt,
    });
    changed();
    return request;
  },
  updateWaiterRequest(requestId: string, status: "ACCEPTED" | "COMPLETED") {
    const requests = this.getWaiterRequests();
    const request = requests.find((item) => item.id === requestId);
    if (!request) throw new Error("طلب الويتر غير موجود في الفرع الحالي.");
    if (status === "ACCEPTED" && request.status !== "NEW")
      throw new Error("تم استلام هذا الطلب من قبل.");
    if (status === "COMPLETED" && request.status !== "ACCEPTED")
      throw new Error("يجب استلام الطلب قبل إكماله.");
    const now = new Date().toISOString();
    const updated: WaiterRequest =
      status === "ACCEPTED"
        ? { ...request, status, acceptedBy: actorId(), acceptedAt: now }
        : { ...request, status, completedBy: actorId(), completedAt: now };
    cafeOperationsService.save(
      "waiterRequests",
      requests.map((item) => (item.id === requestId ? updated : item)),
    );
    cafeOperationsService.audit({
      module: "waiterRequests",
      action:
        status === "ACCEPTED"
          ? "WAITER_REQUEST_ACCEPTED"
          : "WAITER_REQUEST_COMPLETED",
      description: `${status === "ACCEPTED" ? "تم استلام" : "تم إكمال"} طلب خدمة الطاولة ${request.tableNumber ?? request.tableId}`,
      entityType: "waiterRequest",
      entityId: request.id,
    });
    changed();
    return updated;
  },
  getNotifications: () =>
    cafeOperationsService.get<NotificationRecord>("notifications"),
  markNotificationRead(notificationId: string) {
    const records = this.getNotifications();
    cafeOperationsService.save(
      "notifications",
      records.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item,
      ),
    );
    changed();
  },
  markAllNotificationsRead() {
    cafeOperationsService.save(
      "notifications",
      this.getNotifications().map((item) => ({ ...item, read: true })),
    );
    changed();
  },
};
