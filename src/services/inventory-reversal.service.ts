import { convertInventoryQuantity } from "@/lib/inventory-units";
import { roundMoney } from "@/lib/money";
import { branchService } from "@/services/branch.service";
import { cafeDataService } from "@/services/cafe-data.service";
import { cafeOperationsService } from "@/services/cafe-operations.service";
import { tenantService } from "@/services/tenant.service";
import { useAuthStore } from "@/store/auth.store";
import type { InventoryItem, Recipe, StockMovement } from "@/types/cafe-operations.types";
import type { Order } from "@/types/order.types";

const actorId = () => useAuthStore.getState().user?.employeeId ?? useAuthStore.getState().user?.id;

export function restoreOrderInventory(order: Order) {
  const tenantId = tenantService.requireActiveTenantId();
  const branchId = branchService.getActiveBranchId(tenantId);
  if (!order.tenantId || order.tenantId !== tenantId) throw new Error("الطلب لا ينتمي إلى الكافيه الحالي.");
  if (!branchId || order.branchId !== branchId) throw new Error("الطلب لا ينتمي إلى الفرع الحالي.");
  const persisted = cafeDataService.getOrders().find((candidate) => candidate.id === order.id);
  if (order.inventoryRestoredAt || persisted?.inventoryRestoredAt) return { restored: false, order: persisted ?? order };
  if (!order.inventoryConsumedAt) return { restored: false, order };

  const recipes = cafeOperationsService.get<Recipe>("recipes");
  const inventory = cafeOperationsService.get<InventoryItem>("inventory");
  const requirements = new Map<string, number>();
  order.items.forEach((line) => {
    const recipe = recipes.find((candidate) => candidate.productId === line.productId);
    recipe?.ingredients.forEach((ingredient) => {
      const item = inventory.find((candidate) => candidate.id === ingredient.inventoryItemId);
      if (!item) return;
      const quantity = convertInventoryQuantity(ingredient.quantity, ingredient.unit, item.unit) * line.quantity;
      requirements.set(item.id, roundMoney((requirements.get(item.id) ?? 0) + quantity));
    });
  });
  if (!requirements.size) return { restored: false, order };

  const restoredAt = new Date().toISOString();
  const restoredBy = actorId();
  const updated = inventory.map((item) => {
    const quantity = requirements.get(item.id);
    if (!quantity) return item;
    const quantityAfter = roundMoney(item.quantity + quantity);
    cafeOperationsService.create<StockMovement>("stockMovements", {
      inventoryItemId: item.id,
      type: "ORDER_CANCELLATION_RESTORE",
      quantity,
      quantityBefore: item.quantity,
      quantityAfter,
      notes: order.orderNumber,
      createdBy: restoredBy,
      createdAt: restoredAt,
    });
    return { ...item, quantity: quantityAfter, updatedAt: restoredAt };
  });
  cafeOperationsService.save("inventory", updated);
  cafeOperationsService.audit({ module: "inventory", action: "ORDER_INVENTORY_RESTORED", description: `تمت إعادة مخزون الطلب ${order.orderNumber} بعد إلغائه قبل التحضير`, entityType: "order", entityId: order.id });
  return { restored: true, order: { ...order, inventoryRestoredAt: restoredAt, inventoryRestoredBy: restoredBy } };
}
