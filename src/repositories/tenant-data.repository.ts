import { goldenCategories } from "@/mocks/categories.mock";
import { goldenOffers } from "@/mocks/offers.mock";
import { goldenOrders } from "@/mocks/orders.mock";
import { goldenProducts } from "@/mocks/products.mock";
import { goldenTables } from "@/mocks/tables.mock";
import { tenantStorage } from "@/repositories/tenant-storage";
import type { Category } from "@/types/category.types";
import type { Offer } from "@/types/offer.types";
import type { Order } from "@/types/order.types";
import type { Product } from "@/types/product.types";
import type { Table } from "@/types/table.types";

export type CafeSettings = { workingHours: string; taxRate: number; serviceCharge: number; onlineOrdering: boolean; takeaway: boolean; delivery: boolean; paymentMethods: string[]; receiptHeader: string; receiptFooter: string; kitchenSound: boolean };
export type TenantDataset = { products: Product[]; categories: Category[]; orders: Order[]; tables: Table[]; offers: Offer[]; settings: CafeSettings };
const defaults: CafeSettings = { workingHours: "09:00 - 23:00", taxRate: 0, serviceCharge: 0, onlineOrdering: true, takeaway: true, delivery: true, paymentMethods: ["CASH", "CARD"], receiptHeader: "", receiptFooter: "شكرًا لزيارتكم", kitchenSound: true };
const moonCategories: Category[] = [{ id: "moon-cat-1", name: "قهوة مختصة", image: "", sortOrder: 1, isActive: true }, { id: "moon-cat-2", name: "حلويات", image: "", sortOrder: 2, isActive: true }];
const moonProducts: Product[] = [{ id: "moon-prod-1", name: "لاتيه فانيليا", description: "إسبريسو مع حليب وفانيليا", price: 78, categoryId: "moon-cat-1", isAvailable: true }, { id: "moon-prod-2", name: "قهوة اليوم", description: "قهوة مقطرة حسب التحميص المتاح", price: 65, categoryId: "moon-cat-1", isAvailable: true }, { id: "moon-prod-3", name: "تشيز كيك التوت", description: "قطعة تشيز كيك مع صوص التوت", price: 110, categoryId: "moon-cat-2", isAvailable: true }];
const moonOrders: Order[] = [{ id: "moon-ord-1", orderNumber: "MOON-101", tableNumber: 1, orderType: "TABLE", customerName: "سارة", status: "PREPARING", items: [{ id: "moon-oi-1", productId: "moon-prod-1", productName: "لاتيه فانيليا", unitPrice: 78, quantity: 2, totalPrice: 156 }], subtotal: 156, total: 156, createdAt: new Date().toISOString() }];
const moonTables: Table[] = [{ id: "moon-tbl-1", number: 1, qrCode: "moon-qr-table-1", isActive: true }, { id: "moon-tbl-2", number: 2, qrCode: "moon-qr-table-2", isActive: true }, { id: "moon-tbl-3", number: 3, qrCode: "moon-qr-table-3", isActive: true }];
const moonOffers: Offer[] = [{ id: "moon-offer-1", tenantId: "tenant-moon-cafe", title: "باقة المساء", description: "قهوة اليوم مع قطعة حلوى", image: "", originalPrice: 160, price: 125, isActive: true, sortOrder: 1 }];

function seed(tenantId: string): TenantDataset { const isMoon = tenantId === "tenant-moon-cafe"; const isGolden = tenantId === "tenant-golden-drip"; const data = isMoon ? { products: moonProducts, categories: moonCategories, orders: moonOrders, tables: moonTables, offers: moonOffers } : isGolden ? { products: goldenProducts, categories: goldenCategories, orders: goldenOrders, tables: goldenTables, offers: goldenOffers } : { products: [], categories: [], orders: [], tables: [], offers: [] }; return { products: data.products.map((item) => ({ ...item, tenantId })), categories: data.categories.map((item) => ({ ...item, tenantId })), orders: data.orders.map((item) => ({ ...item, tenantId })), tables: data.tables.map((item) => ({ ...item, tenantId })), offers: data.offers.map((item) => ({ ...item, tenantId })), settings: { ...defaults } }; }

function resource<T>(tenantId: string, name: keyof TenantDataset, initial: T): T {
  const stored = tenantStorage.get(tenantId, name, initial);
  if (
    tenantId === "tenant-golden-drip" &&
    name === "products" &&
    Array.isArray(stored) &&
    !tenantStorage.get<boolean>(
      tenantId,
      "migration:golden-products-v2",
      false,
    )
  ) {
    const productIds = new Set(
      (stored as Array<{ id?: string }>).map((item) => item.id).filter(Boolean),
    );
    const menuItems = tenantStorage.get<Array<{ productId: string }>>(
      tenantId,
      "menu-items",
      [],
    );
    const hasExpectedProduct = menuItems.some((item) =>
      productIds.has(item.productId),
    );
    const containsForeignSeed = [...productIds].some((id) =>
      id?.startsWith("moon-prod-"),
    );
    tenantStorage.set(tenantId, "migration:golden-products-v2", true);
    if (
      productIds.size === 0 ||
      (menuItems.length > 0 && !hasExpectedProduct) ||
      containsForeignSeed
    ) {
      tenantStorage.set(tenantId, name, initial);
      return initial;
    }
  }
  return stored;
}
export const tenantDataRepository = {
  getProducts: (tenantId: string) => resource(tenantId, "products", seed(tenantId).products),
  saveProducts: (tenantId: string, value: Product[]) => tenantStorage.set(tenantId, "products", value),
  getCategories: (tenantId: string) => resource(tenantId, "categories", seed(tenantId).categories),
  saveCategories: (tenantId: string, value: Category[]) => tenantStorage.set(tenantId, "categories", value),
  getOrders: (tenantId: string) => resource(tenantId, "orders", seed(tenantId).orders),
  saveOrders: (tenantId: string, value: Order[]) => tenantStorage.set(tenantId, "orders", value),
  getTables: (tenantId: string) => resource(tenantId, "tables", seed(tenantId).tables),
  saveTables: (tenantId: string, value: Table[]) => tenantStorage.set(tenantId, "tables", value),
  getOffers: (tenantId: string) => resource(tenantId, "offers", seed(tenantId).offers),
  saveOffers: (tenantId: string, value: Offer[]) => tenantStorage.set(tenantId, "offers", value),
  getSettings: (tenantId: string) => resource(tenantId, "settings", defaults),
  saveSettings: (tenantId: string, value: CafeSettings) => tenantStorage.set(tenantId, "settings", value),
};
