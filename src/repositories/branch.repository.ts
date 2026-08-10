import { tenantStorage } from "@/repositories/tenant-storage";
import type { Branch, Menu, MenuItem } from "@/types/branch.types";

const now = "2026-08-10T10:00:00.000Z";
const defaults = {
  dineInEnabled: true,
  takeawayEnabled: true,
  deliveryEnabled: true,
  preparationTime: 20,
};

function branchSeeds(tenantId: string): Branch[] {
  if (tenantId === "tenant-golden-drip")
    return [
      {
        id: "branch-golden-nasr",
        tenantId,
        name: "فرع مدينة نصر",
        code: "NSR",
        phone: "01000000001",
        address: "مدينة نصر، القاهرة",
        status: "ACTIVE",
        menuId: "menu-golden-cairo",
        settings: defaults,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "branch-golden-cairo",
        tenantId,
        name: "فرع التجمع",
        code: "NCA",
        phone: "01000000002",
        address: "التجمع الخامس، القاهرة الجديدة",
        status: "ACTIVE",
        menuId: "menu-golden-new-cairo",
        settings: { ...defaults, preparationTime: 25 },
        createdAt: now,
        updatedAt: now,
      },
    ];
  if (tenantId === "tenant-moon-cafe")
    return [
      {
        id: "branch-moon-main",
        tenantId,
        name: "الفرع الرئيسي",
        code: "MAIN",
        address: "القاهرة",
        status: "ACTIVE",
        menuId: "menu-moon-main",
        settings: defaults,
        createdAt: now,
        updatedAt: now,
      },
    ];
  return [];
}

function menuSeeds(tenantId: string): Menu[] {
  if (tenantId === "tenant-golden-drip")
    return [
      {
        id: "menu-golden-cairo",
        tenantId,
        name: "منيو القاهرة",
        description: "أسعار فرع مدينة نصر",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "menu-golden-new-cairo",
        tenantId,
        name: "منيو القاهرة الجديدة",
        description: "أسعار فرع التجمع",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      },
    ];
  if (tenantId === "tenant-moon-cafe")
    return [
      {
        id: "menu-moon-main",
        tenantId,
        name: "المنيو الرئيسي",
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      },
    ];
  return [];
}

function itemSeeds(tenantId: string): MenuItem[] {
  const create = (
    menuId: string,
    ids: string[],
    prices: Record<string, number> = {},
  ) =>
    ids.map((productId, index) => ({
      id: `${menuId}-${productId}`,
      tenantId,
      menuId,
      productId,
      price: prices[productId] ?? 0,
      available: true,
      sortOrder: index + 1,
    }));
  if (tenantId === "tenant-golden-drip") {
    const ids = Array.from({ length: 20 }, (_, index) => `prod-${index + 1}`);
    return [
      ...create("menu-golden-cairo", ids, { "prod-6": 85 }),
      ...create("menu-golden-new-cairo", ids, { "prod-6": 100 }),
    ];
  }
  if (tenantId === "tenant-moon-cafe")
    return create("menu-moon-main", [
      "moon-prod-1",
      "moon-prod-2",
      "moon-prod-3",
    ]);
  return [];
}

export const branchRepository = {
  getBranches: (tenantId: string) =>
    tenantStorage.get<Branch[]>(tenantId, "branches", branchSeeds(tenantId)),
  saveBranches: (tenantId: string, branches: Branch[]) =>
    tenantStorage.set(tenantId, "branches", branches),
  getMenus: (tenantId: string) =>
    tenantStorage.get<Menu[]>(tenantId, "menus", menuSeeds(tenantId)),
  saveMenus: (tenantId: string, menus: Menu[]) =>
    tenantStorage.set(tenantId, "menus", menus),
  getMenuItems: (tenantId: string) =>
    tenantStorage.get<MenuItem[]>(tenantId, "menu-items", itemSeeds(tenantId)),
  saveMenuItems: (tenantId: string, items: MenuItem[]) =>
    tenantStorage.set(tenantId, "menu-items", items),
  getActiveBranchId: (tenantId: string) =>
    tenantStorage.get<string | null>(tenantId, "active-branch", null),
  setActiveBranchId: (tenantId: string, branchId: string | null) =>
    tenantStorage.set(tenantId, "active-branch", branchId),
};
