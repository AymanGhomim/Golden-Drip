export type PermissionKey =
  | "dashboard.view"
  | "pos.use"
  | "orders.view" | "orders.create" | "orders.update" | "orders.cancel" | "orders.refund" | "orders.print"
  | "products.view" | "products.create" | "products.update" | "products.delete"
  | "categories.view" | "categories.manage"
  | "menus.view" | "menus.manage"
  | "branches.view" | "branches.manage"
  | "tables.view" | "tables.manage"
  | "qr.view" | "qr.manage"
  | "kitchen.view" | "kitchen.update"
  | "inventory.view" | "inventory.create" | "inventory.adjust" | "inventory.stockCount" | "inventory.waste"
  | "purchases.view" | "purchases.create" | "purchases.update" | "purchases.receive"
  | "suppliers.view" | "suppliers.manage"
  | "customers.view" | "customers.manage"
  | "loyalty.view" | "loyalty.manage"
  | "coupons.view" | "coupons.manage"
  | "deliveryZones.view" | "deliveryZones.manage"
  | "payments.view"
  | "refunds.view" | "refunds.create"
  | "expenses.view" | "expenses.create" | "expenses.update" | "expenses.delete"
  | "cashRegister.view" | "cashRegister.manage"
  | "shifts.view" | "shifts.open" | "shifts.close"
  | "employees.view" | "employees.create" | "employees.update" | "employees.suspend"
  | "roles.view" | "roles.manage"
  | "reports.view"
  | "notifications.view" | "notifications.manage"
  | "audit.view"
  | "settings.view" | "settings.edit";

export type EmployeeStatus = "ACTIVE" | "SUSPENDED";
export type BranchAccessMode = "ALL" | "SELECTED";

export type CafeRole = {
  id: string;
  tenantId: string;
  code?: "OWNER" | "MANAGER" | "CASHIER" | "WAITER" | "KITCHEN";
  name: string;
  description?: string;
  systemRole: boolean;
  permissions: PermissionKey[];
  createdAt: string;
  updatedAt: string;
};

export type CafeEmployee = {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  username?: string;
  roleId: string;
  branchAccess: BranchAccessMode;
  branchIds: string[];
  status: EmployeeStatus;
  joinDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type PermissionDefinition = {
  key: PermissionKey;
  label: string;
  description: string;
  group: string;
  groupLabel: string;
};
