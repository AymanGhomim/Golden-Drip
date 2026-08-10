import { tenantDataRepository } from "@/repositories/tenant-data.repository";
import { tenantService } from "@/services/tenant.service";
import type { CafeSettings } from "@/repositories/tenant-data.repository";
import { branchService } from "@/services/branch.service";

function activeTenantId() { return tenantService.requireActiveTenantId(); }
function allBranchOrders(id: string) { const branches = branchService.getBranches(id); return tenantDataRepository.getOrders(id).map((order, index) => ({ ...order, tenantId: id, branchId: order.branchId ?? branches[index % Math.max(1, branches.length)]?.id })); }
function allBranchTables(id: string) { const branches = branchService.getBranches(id); return tenantDataRepository.getTables(id).map((table, index) => ({ ...table, tenantId: id, branchId: table.branchId ?? branches[index % Math.max(1, branches.length)]?.id })); }
export const cafeDataService = {
  tenantId: activeTenantId,
  getProducts: () => tenantDataRepository.getProducts(activeTenantId()),
  saveProducts: (value: ReturnType<typeof tenantDataRepository.getProducts>) =>
    tenantDataRepository.saveProducts(activeTenantId(), value),
  getCategories: () => tenantDataRepository.getCategories(activeTenantId()),
  saveCategories: (
    value: ReturnType<typeof tenantDataRepository.getCategories>,
  ) => tenantDataRepository.saveCategories(activeTenantId(), value),
  getOrders: () => {
    const id = activeTenantId();
    const branchId = branchService.getActiveBranchId(id);
    return branchId
      ? allBranchOrders(id).filter((order) => order.branchId === branchId)
      : [];
  },
  saveOrders: (value: ReturnType<typeof tenantDataRepository.getOrders>) => {
    const id = activeTenantId();
    const branchId = branchService.getActiveBranchId(id);
    if (!branchId) return value;
    const other = allBranchOrders(id).filter((order) => order.branchId !== branchId);
    return tenantDataRepository.saveOrders(id, [
      ...other,
      ...value.map((order) => ({ ...order, tenantId: id, branchId })),
    ]);
  },
  getTables: () => {
    const id = activeTenantId();
    const branchId = branchService.getActiveBranchId(id);
    return branchId
      ? allBranchTables(id).filter((table) => table.branchId === branchId)
      : [];
  },
  saveTables: (value: ReturnType<typeof tenantDataRepository.getTables>) => {
    const id = activeTenantId();
    const branchId = branchService.getActiveBranchId(id);
    if (!branchId) return value;
    const other = allBranchTables(id).filter((table) => table.branchId !== branchId);
    return tenantDataRepository.saveTables(id, [
      ...other,
      ...value.map((table) => ({ ...table, tenantId: id, branchId })),
    ]);
  },
  getBranchProducts: () => branchService.getBranchProducts(),
  getOffers: () => tenantDataRepository.getOffers(activeTenantId()),
  saveOffers: (value: ReturnType<typeof tenantDataRepository.getOffers>) =>
    tenantDataRepository.saveOffers(activeTenantId(), value),
  getSettings: () => tenantDataRepository.getSettings(activeTenantId()),
  saveSettings: (value: CafeSettings) =>
    tenantDataRepository.saveSettings(activeTenantId(), value),
};
