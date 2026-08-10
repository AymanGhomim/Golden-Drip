import { tenantStorage } from "@/repositories/tenant-storage";
import { tenantService } from "@/services/tenant.service";
import type {
  OperationRecord,
  OperationResource,
} from "@/types/cafe-operations.types";
import { branchService } from "@/services/branch.service";

const resources: OperationResource[] = [
  "inventory",
  "stockMovements",
  "stockCounts",
  "waste",
  "recipes",
  "suppliers",
  "purchases",
  "expenses",
  "customers",
  "loyalty",
  "coupons",
  "deliveryZones",
  "payments",
  "refunds",
  "cashRegister",
  "shifts",
  "notifications",
  "auditLog",
];
const activeTenant = () => tenantService.requireActiveTenantId();
const tenantLevel = new Set<OperationResource>([
  "recipes",
  "suppliers",
  "customers",
  "loyalty",
  "coupons",
  "auditLog",
]);
const seed = (
  resource: OperationResource,
  tenantId: string,
): OperationRecord[] => {
  if (tenantId === "tenant-golden-drip" && resource === "inventory")
    return [
      {
        id: "inv-coffee",
        tenantId,
        name: "حبوب أرابيكا",
        unit: "كجم",
        quantity: 18,
        minimumStock: 10,
        averageCost: 280,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  if (tenantId === "tenant-moon-cafe" && resource === "inventory")
    return [
      {
        id: "moon-inv-milk",
        tenantId,
        name: "حليب كامل الدسم",
        unit: "لتر",
        quantity: 24,
        minimumStock: 8,
        averageCost: 28,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  return [];
};
export const cafeOperationsRepository = {
  resources,
  get<T extends OperationRecord = OperationRecord>(
    resource: OperationResource,
    tenantId = activeTenant(),
  ): T[] {
    const branchId = branchService.getActiveBranchId(tenantId);
    if (tenantLevel.has(resource))
      return tenantStorage.get<T[]>(
        tenantId,
        resource,
        seed(resource, tenantId) as T[],
      );
    if (!branchId) return [];
    const initial = seed(resource, tenantId).map((record) => ({
      ...record,
      branchId,
      quantity:
        resource === "inventory" && branchId === "branch-golden-cairo"
          ? 7
          : record.quantity,
    })) as unknown as T[];
    return tenantStorage.getForBranch<T[]>(
      tenantId,
      branchId,
      resource,
      initial,
    );
  },
  set<T extends OperationRecord = OperationRecord>(
    resource: OperationResource,
    records: T[],
    tenantId = activeTenant(),
  ) {
    const branchId = branchService.getActiveBranchId(tenantId);
    if (tenantLevel.has(resource))
      return tenantStorage.set(tenantId, resource, records);
    if (!branchId) return records;
    return tenantStorage.setForBranch(
      tenantId,
      branchId,
      resource,
      records.map((record) => ({ ...record, tenantId, branchId })),
    );
  },
};
