import type { CafeEmployee, CafeRole, PermissionKey } from "@contracts/access-control.types";
import type { Branch, Menu, MenuItem } from "@contracts/branch.types";
import type { ClientType, Tenant, TenantFeatures } from "@contracts/tenant.types";
import type { Order, OrderStatus } from "@contracts/order.types";
import type { CafeEmployee as DevelopmentEmployee, CafeRole as DevelopmentRole } from "@contracts/access-control.types";
import type { Table } from "@contracts/table.types";
import type { OperationRecord, OperationResource } from "@contracts/cafe-operations.types";
import type { Product } from "@contracts/product.types";
import type { Category } from "@contracts/category.types";
import type { Offer } from "@contracts/offer.types";

export type DesktopSession = {
  accessToken?: string;
  expiresIn?: number;
  user: { id: string; name: string; email: string };
  employee: CafeEmployee;
  tenant: Tenant;
  role: CafeRole;
  permissions: PermissionKey[];
  accessibleBranches: Branch[];
  currentBranch: Branch | null;
  features: TenantFeatures;
  clientType: ClientType;
};

export type DesktopOrderStatus = OrderStatus;
export type DesktopOrder = Order;

export type SellableMenuItem = {
  id: string;
  menuId: string;
  productId: string;
  name: string;
  description: string;
  image?: string;
  categoryId: string;
  category: string;
  menuItemPrice: number;
};

export type DesktopDevelopmentSnapshot = {
  branches: Branch[];
  products: Product[];
  categories: Category[];
  menus: Menu[];
  rawMenuItems: MenuItem[];
  offers: Offer[];
  orders: DesktopOrder[];
  menuItems: SellableMenuItem[];
  tables: Table[];
  inventory: OperationRecord[];
  employees: DevelopmentEmployee[];
  roles: DevelopmentRole[];
  operations: Record<OperationResource, OperationRecord[]>;
};
