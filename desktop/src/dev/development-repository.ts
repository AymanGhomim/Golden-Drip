import {
  cloneDevelopmentFixture,
  developmentBranches,
  developmentCategories,
  developmentEmployees,
  developmentOffers,
  developmentMenuItems,
  developmentMenus,
  developmentOperations,
  developmentOrders,
  developmentProducts,
  developmentRoles,
  developmentTables,
  developmentTenants,
} from "@shared/development-data";
import type { PermissionKey } from "@contracts/access-control.types";
import type { OperationResource } from "@contracts/cafe-operations.types";
import type { Order } from "@contracts/order.types";
import type { DesktopDevelopmentSnapshot, DesktopSession, SellableMenuItem } from "@/types";

function tenantRecords<T extends { tenantId?: string }>(records: T[], tenantId: string) {
  return cloneDevelopmentFixture(records.filter((record) => record.tenantId === tenantId));
}

export const desktopDevelopmentRepository = {
  findTenantBySlug(slug: string) {
    return cloneDevelopmentFixture(developmentTenants.find((tenant) => tenant.slug === slug));
  },
  getBranches(tenantId: string) {
    return tenantRecords(developmentBranches, tenantId);
  },
  getEmployeeByLogin(tenantId: string, login: string) {
    const normalized = login.trim().toLowerCase();
    return cloneDevelopmentFixture(
      developmentEmployees.find(
        (employee) =>
          employee.tenantId === tenantId &&
          [employee.email?.toLowerCase(), employee.username?.toLowerCase()].includes(normalized),
      ),
    );
  },
  getRole(tenantId: string, roleId: string) {
    return cloneDevelopmentFixture(
      developmentRoles.find((role) => role.tenantId === tenantId && role.id === roleId),
    );
  },
  getOrders(tenantId: string, branchId?: string): Order[] {
    return tenantRecords(developmentOrders, tenantId).filter(
      (order) => !branchId || order.branchId === branchId,
    );
  },
  getTables(tenantId: string, branchId: string) {
    return tenantRecords(developmentTables, tenantId).filter(
      (table) => table.branchId === branchId,
    );
  },
  getOperations(tenantId: string, resource: OperationResource, branchId?: string) {
    return cloneDevelopmentFixture(developmentOperations[tenantId]?.[resource] ?? []).filter(
      (record) => !branchId || !record.branchId || record.branchId === branchId,
    );
  },
  getSellableMenuItems(tenantId: string, branchId: string): SellableMenuItem[] {
    const branch = developmentBranches.find(
      (item) => item.tenantId === tenantId && item.id === branchId,
    );
    const menu = developmentMenus.find(
      (item) => item.tenantId === tenantId && item.id === branch?.menuId,
    );
    if (!menu) return [];
    const products = new Map(
      developmentProducts
        .filter((product) => product.tenantId === tenantId)
        .map((product) => [product.id, product]),
    );
    const categories = new Map(
      developmentCategories
        .filter((category) => category.tenantId === tenantId)
        .map((category) => [category.id, category]),
    );
    return developmentMenuItems
      .filter((item) => item.tenantId === tenantId && item.menuId === menu.id && item.available)
      .flatMap((menuItem): SellableMenuItem[] => {
        const product = products.get(menuItem.productId);
        if (!product?.isAvailable) return [];
        return [{
          id: menuItem.id,
          menuId: menu.id,
          productId: product.id,
          name: product.name,
          description: product.description,
          image: product.image,
          categoryId: product.categoryId,
          category: categories.get(product.categoryId)?.name ?? "غير مصنف",
          menuItemPrice: menuItem.price,
        }];
      });
  },
  createSession(tenantSlug: string, login: string): DesktopSession | null {
    const tenant = this.findTenantBySlug(tenantSlug);
    if (!tenant) return null;
    const employee = this.getEmployeeByLogin(tenant.id, login);
    if (!employee || employee.status !== "ACTIVE") return null;
    const role = this.getRole(tenant.id, employee.roleId);
    if (!role) return null;
    const allBranches = this.getBranches(tenant.id).filter((branch) => branch.status === "ACTIVE");
    const accessibleBranches = employee.branchAccess === "ALL"
      ? allBranches
      : allBranches.filter((branch) => employee.branchIds.includes(branch.id));
    return {
      user: { id: employee.id, name: employee.name, email: employee.email ?? "" },
      employee,
      tenant,
      role,
      permissions: cloneDevelopmentFixture(role.permissions) as PermissionKey[],
      accessibleBranches,
      currentBranch: accessibleBranches[0] ?? null,
      features: cloneDevelopmentFixture(tenant.features),
      clientType: "DESKTOP",
    };
  },
  createSnapshot(tenantId: string, branchId: string): DesktopDevelopmentSnapshot {
    const operations = cloneDevelopmentFixture(
      developmentOperations[tenantId],
    );
    Object.keys(operations).forEach((resource) => {
      operations[resource as OperationResource] = operations[
        resource as OperationResource
      ].filter(
        (record) => !record.branchId || record.branchId === branchId,
      );
    });
    return {
      branches: tenantRecords(developmentBranches, tenantId),
      products: tenantRecords(developmentProducts, tenantId),
      categories: tenantRecords(developmentCategories, tenantId),
      menus: tenantRecords(developmentMenus, tenantId),
      rawMenuItems: tenantRecords(developmentMenuItems, tenantId),
      offers: tenantRecords(developmentOffers, tenantId),
      orders: this.getOrders(tenantId, branchId),
      menuItems: this.getSellableMenuItems(tenantId, branchId),
      tables: this.getTables(tenantId, branchId),
      inventory: this.getOperations(tenantId, "inventory", branchId),
      employees: tenantRecords(developmentEmployees, tenantId),
      roles: tenantRecords(developmentRoles, tenantId),
      operations,
    };
  },
};
