import { DEFAULT_ROLE_PERMISSIONS } from "@/config/permissions.config";
import { tenantStorage } from "@/repositories/tenant-storage";
import type { CafeEmployee, CafeRole } from "@/types/access-control.types";

const timestamp = "2026-08-10T10:00:00.000Z";
const roleId = (tenantId: string, code: string) => `${tenantId}:role:${code}`;

function roleSeeds(tenantId: string): CafeRole[] {
  const templates = [
    ["OWNER", "المالك", "صلاحيات كاملة داخل الكافيه"],
    ["MANAGER", "المدير", "إدارة التشغيل اليومي للكافيه"],
    ["CASHIER", "الكاشير", "المبيعات والمدفوعات والورديات"],
    ["WAITER", "الويتر", "الطلبات والطاولات وخدمة العملاء"],
    ["KITCHEN", "المطبخ", "متابعة وتحضير طلبات المطبخ"],
  ] as const;
  const roles: CafeRole[] = templates.map(([code, name, description]) => ({
    id: roleId(tenantId, code), tenantId, code, name, description, systemRole: true,
    permissions: [...DEFAULT_ROLE_PERMISSIONS[code]], createdAt: timestamp, updatedAt: timestamp,
  }));
  if (tenantId === "tenant-golden-drip") roles.push({
    id: `${tenantId}:role:inventory-controller`, tenantId, name: "مسؤول المخزون", description: "متابعة المخزون والجرد والهالك والمشتريات", systemRole: false,
    permissions: ["dashboard.view", "inventory.view", "inventory.adjust", "inventory.stockCount", "inventory.waste", "purchases.view"], createdAt: timestamp, updatedAt: timestamp,
  });
  return roles;
}

function employeeSeeds(tenantId: string): CafeEmployee[] {
  const make = (id: string, name: string, code: string, email: string, branchAccess: "ALL" | "SELECTED", branchIds: string[]): CafeEmployee => ({
    id: `${tenantId}:employee:${id}`, tenantId, name, phone: "01000000000", email, username: id,
    roleId: roleId(tenantId, code), branchAccess, branchIds, status: "ACTIVE", joinDate: "2026-01-01", createdAt: timestamp, updatedAt: timestamp,
  });
  if (tenantId === "tenant-golden-drip") return [
    make("owner", "مالك Golden Drip", "OWNER", "owner@golden-drip.demo", "ALL", []),
    make("manager", "سارة المدير", "MANAGER", "manager@golden-drip.demo", "ALL", []),
    make("cashier", "أحمد الكاشير", "CASHIER", "cashier@golden-drip.demo", "SELECTED", ["branch-golden-nasr"]),
    make("waiter", "محمد الويتر", "WAITER", "waiter@golden-drip.demo", "SELECTED", ["branch-golden-nasr", "branch-golden-cairo"]),
    make("kitchen", "علي المطبخ", "KITCHEN", "kitchen@golden-drip.demo", "SELECTED", ["branch-golden-cairo"]),
    { ...make("inventory", "محمود المخزون", "OWNER", "inventory@golden-drip.demo", "SELECTED", ["branch-golden-nasr"]), roleId: `${tenantId}:role:inventory-controller` },
  ];
  if (tenantId === "tenant-moon-cafe") return [
    make("owner", "مالك Moon Café", "OWNER", "owner@moon-cafe.demo", "ALL", []),
    make("cashier", "كاشير Moon Café", "CASHIER", "cashier@moon-cafe.demo", "SELECTED", ["branch-moon-main"]),
  ];
  return [];
}

export const accessControlRepository = {
  getRoles: (tenantId: string) => tenantStorage.get<CafeRole[]>(tenantId, "access-roles", roleSeeds(tenantId)),
  saveRoles: (tenantId: string, roles: CafeRole[]) => tenantStorage.set(tenantId, "access-roles", roles),
  getEmployees: (tenantId: string) => tenantStorage.get<CafeEmployee[]>(tenantId, "access-employees", employeeSeeds(tenantId)),
  saveEmployees: (tenantId: string, employees: CafeEmployee[]) => tenantStorage.set(tenantId, "access-employees", employees),
};
