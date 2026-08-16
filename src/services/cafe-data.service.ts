import { tenantDataRepository } from "@/repositories/tenant-data.repository";
import { tenantService } from "@/services/tenant.service";
import type { CafeSettings } from "@/repositories/tenant-data.repository";
import { branchService } from "@/services/branch.service";

function activeTenantId() { return tenantService.requireActiveTenantId(); }
const LEGACY_DEFAULT_BRANCH_BY_TENANT: Record<string, string> = {
  "tenant-golden-drip": "branch-golden-nasr",
  "tenant-moon-cafe": "branch-moon-main",
};

function legacyDefaultBranchId(id: string) {
  const branches = branchService.getBranches(id);
  const configured = LEGACY_DEFAULT_BRANCH_BY_TENANT[id];
  if (configured && branches.some((branch) => branch.id === configured)) return configured;
  return branches.length === 1 ? branches[0].id : undefined;
}

export function getTenantOrders(id: string) {
  const fallbackBranchId = legacyDefaultBranchId(id);
  return tenantDataRepository.getOrders(id).map((order) => ({
    ...order,
    tenantId: id,
    branchId: order.branchId ?? fallbackBranchId,
  }));
}

export function getTenantTables(id: string) {
  const fallbackBranchId = legacyDefaultBranchId(id);
  return tenantDataRepository.getTables(id).map((table) => ({
    ...table,
    tenantId: id,
    branchId: table.branchId ?? fallbackBranchId,
  }));
}
export const cafeDataService = {
  tenantId: activeTenantId,
  getProducts: (id = activeTenantId()) => tenantDataRepository.getProducts(id),
  saveProducts: (value: ReturnType<typeof tenantDataRepository.getProducts>) =>
    tenantDataRepository.saveProducts(activeTenantId(), value),
  getCategories: (id = activeTenantId()) => tenantDataRepository.getCategories(id),
  saveCategories: (
    value: ReturnType<typeof tenantDataRepository.getCategories>,
  ) => tenantDataRepository.saveCategories(activeTenantId(), value),
  getOrders: () => {
    const id = activeTenantId();
    const branchId = branchService.getActiveBranchId(id);
    return branchId
      ? getTenantOrders(id).filter((order) => order.branchId === branchId)
      : [];
  },
  getOrdersForBranch: (branchId: string, id = activeTenantId()) =>
    getTenantOrders(id).filter((order) => order.branchId === branchId),
  saveOrders: (value: ReturnType<typeof tenantDataRepository.getOrders>) => {
    const id = activeTenantId();
    const branchId = branchService.getActiveBranchId(id);
    if (!branchId) return value;
    const other = getTenantOrders(id).filter((order) => order.branchId !== branchId);
    const saved = tenantDataRepository.saveOrders(id, [
      ...other,
      ...value.map((order) => ({ ...order, tenantId: id, branchId })),
    ]);
    if (typeof window !== "undefined")
      window.dispatchEvent(new Event("orders:changed"));
    return saved;
  },
  getTables: () => {
    const id = activeTenantId();
    const branchId = branchService.getActiveBranchId(id);
    return branchId
      ? getTenantTables(id).filter((table) => table.branchId === branchId)
      : [];
  },
  getTablesForBranch: (branchId: string, id = activeTenantId()) =>
    getTenantTables(id).filter((table) => table.branchId === branchId),
  saveTables: (value: ReturnType<typeof tenantDataRepository.getTables>) => {
    const id = activeTenantId();
    const branchId = branchService.getActiveBranchId(id);
    if (!branchId) return value;
    const other = getTenantTables(id).filter((table) => table.branchId !== branchId);
    return tenantDataRepository.saveTables(id, [
      ...other,
      ...value.map((table) => ({ ...table, tenantId: id, branchId })),
    ]);
  },
  saveTablesForBranch: (
    branchId: string,
    value: ReturnType<typeof tenantDataRepository.getTables>,
    id = activeTenantId(),
  ) => {
    if (!branchService.getBranch(branchId, id))
      throw new Error("الفرع غير موجود داخل الكافيه الحالي.");
    const other = getTenantTables(id).filter(
      (table) => table.branchId !== branchId,
    );
    return tenantDataRepository.saveTables(id, [
      ...other,
      ...value.map((table) => ({
        ...table,
        tenantId: id,
        branchId,
      })),
    ]);
  },
  getBranchProducts: (
    branchId?: string,
    id = activeTenantId(),
  ) => branchService.getBranchProducts(
    branchId ?? branchService.getActiveBranchId(id) ?? "",
    id,
  ),
  getOffers: (id = activeTenantId()) => tenantDataRepository.getOffers(id),
  saveOffers: (value: ReturnType<typeof tenantDataRepository.getOffers>) =>
    tenantDataRepository.saveOffers(activeTenantId(), value),
  getSettings: () => tenantDataRepository.getSettings(activeTenantId()),
  saveSettings: (value: CafeSettings) =>
    tenantDataRepository.saveSettings(activeTenantId(), value),
};
