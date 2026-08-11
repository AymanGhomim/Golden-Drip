import type { CafeEmployee, CafeRole } from "../../src/types/access-control.types";
import type { Branch, Menu, MenuItem } from "../../src/types/branch.types";
import type { OperationRecord, OperationResource } from "../../src/types/cafe-operations.types";
import type { Category } from "../../src/types/category.types";
import type { Offer } from "../../src/types/offer.types";
import type { Order } from "../../src/types/order.types";
import type { Product } from "../../src/types/product.types";
import type { Table } from "../../src/types/table.types";
import type { Tenant } from "../../src/types/tenant.types";
import { DEFAULT_ROLE_PERMISSIONS } from "../../src/config/permissions.config";

export const DEVELOPMENT_TENANT_IDS = {
  goldenDrip: "tenant-golden-drip",
  moonCafe: "tenant-moon-cafe",
} as const;

const timestamp = "2026-08-10T10:00:00.000Z";
const branchSettings = {
  dineInEnabled: true,
  takeawayEnabled: true,
  deliveryEnabled: true,
  preparationTime: 20,
};
const enabledFeatures = {
  onlineMenu: true,
  qrOrdering: true,
  delivery: true,
  inventory: true,
  reports: true,
  pos: true,
  orders: true,
  tables: true,
  kitchen: true,
  takeaway: true,
  recipes: true,
  suppliers: true,
  purchases: true,
  expenses: true,
  loyalty: true,
  employees: true,
  advancedReports: true,
};

export const developmentTenants: Tenant[] = [
  {
    id: DEVELOPMENT_TENANT_IDS.goldenDrip,
    slug: "golden-drip",
    name: "Golden Drip Café",
    legalName: "Golden Drip Café",
    status: "ACTIVE",
    plan: "GROWTH",
    subscriptionStatus: "ACTIVE",
    adminClientMode: "BOTH",
    maxBranchesOverride: 1,
    branding: {
      logo: "/logo-transparent.png",
      primary: "#32170e",
      primaryForeground: "#ffffff",
      secondary: "#8a4a26",
      secondaryForeground: "#ffffff",
      accent: "#b47745",
      accentForeground: "#ffffff",
      background: "#f5ede5",
      surface: "#fffaf5",
      surfaceSecondary: "#f1e5d9",
      sidebar: "#eadbca",
      sidebarText: "#5b3524",
      sidebarActive: "#32170e",
      sidebarActiveForeground: "#ffffff",
      textPrimary: "#32170e",
      textSecondary: "#76665e",
      muted: "#efe3d7",
      border: "#d7c0ab",
      radius: "0.75rem",
      fontFamily: "Cairo",
      login: {
        backgroundColor: "#e9d9c9",
        welcomeTitle: "مرحبًا بعودتك!",
        subtitle: "سجّل الدخول لإدارة الكافيه ومتابعة كل شيء بسلاسة.",
        cardStyle: "solid",
      },
      receipt: {
        header: "شكرًا لزيارتكم",
        footer: "نتمنى رؤيتكم قريبًا",
        showQr: true,
      },
      qr: {
        foregroundColor: "#21100a",
        title: "افتح المنيو",
        helperText: "امسح الكود للطلب",
      },
    },
    contact: {
      phone: "01050555375",
      whatsapp: "01050555375",
      address: "كفر الشيخ، شارع الاستاد أمام بوابة سيتي كلوب الخلفية",
      locationUrl:
        "https://www.google.com/maps/search/?api=1&query=%D9%83%D9%81%D8%B1+%D8%A7%D9%84%D8%B4%D9%8A%D8%AE+%D8%B4%D8%A7%D8%B1%D8%B9+%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%A7%D8%AF+%D8%B3%D9%8A%D8%AA%D9%8A+%D9%83%D9%84%D9%88%D8%A8",
      facebook: "https://www.facebook.com/people/Golden-Drip/61581964776493/",
      instagram: "https://www.instagram.com/goldendrip.cafe",
      tiktok: "https://www.tiktok.com/@golden_drip_",
    },
    settings: {
      currency: "EGP",
      currencySymbol: "ج.م",
      timezone: "Africa/Cairo",
      locale: "ar",
      taxRate: 14,
    },
    features: enabledFeatures,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: DEVELOPMENT_TENANT_IDS.moonCafe,
    slug: "moon-cafe",
    name: "Moon Café",
    status: "TRIAL",
    plan: "STARTER",
    subscriptionStatus: "TRIALING",
    adminClientMode: "WEB",
    branding: {
      logo: "/moon-cafe.svg",
      primary: "#17324d",
      primaryForeground: "#ffffff",
      secondary: "#2c668f",
      secondaryForeground: "#ffffff",
      accent: "#d59b4a",
      accentForeground: "#17202a",
      background: "#edf4f7",
      surface: "#ffffff",
      surfaceSecondary: "#e3eef3",
      sidebar: "#dcecf1",
      sidebarText: "#17324d",
      sidebarActive: "#17324d",
      sidebarActiveForeground: "#ffffff",
      textPrimary: "#17324d",
      textSecondary: "#557080",
      muted: "#e5eff3",
      border: "#bdd4df",
      radius: "1rem",
      fontFamily: "Tajawal",
      login: {
        backgroundColor: "#dcecf1",
        welcomeTitle: "أهلًا بك في Moon Café",
        subtitle: "إدارة يومك تبدأ من هنا.",
        cardStyle: "solid",
      },
      receipt: { header: "Moon Café", footer: "شكرًا لزيارتكم", showQr: true },
      qr: {
        foregroundColor: "#17324d",
        title: "قائمة Moon Café",
        helperText: "امسح الرمز لفتح المنيو",
      },
    },
    contact: { phone: "01000000000", address: "القاهرة الجديدة" },
    settings: {
      currency: "EGP",
      currencySymbol: "ج.م",
      timezone: "Africa/Cairo",
      locale: "ar",
      taxRate: 14,
    },
    features: enabledFeatures,
    createdAt: "2026-08-01T00:00:00.000Z",
  },
];

export const developmentBranches: Branch[] = [
  {
    id: "branch-golden-nasr",
    tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip,
    name: "فرع كفر الشيخ",
    code: "KFS",
    phone: "01050555375",
    address: "كفر الشيخ، شارع الاستاد أمام بوابة سيتي كلوب الخلفية",
    status: "ACTIVE",
    menuId: "menu-golden-cairo",
    settings: branchSettings,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "branch-moon-main",
    tenantId: DEVELOPMENT_TENANT_IDS.moonCafe,
    name: "الفرع الرئيسي",
    code: "MAIN",
    address: "القاهرة",
    status: "ACTIVE",
    menuId: "menu-moon-main",
    settings: branchSettings,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];

export const developmentCategories: Category[] = [
  { id: "cat-1", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, name: "Hot Coffee", image: "", sortOrder: 1, isActive: true },
  { id: "cat-2", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, name: "Iced Coffee", image: "", sortOrder: 2, isActive: true },
  { id: "cat-3", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, name: "Tea & Matcha", image: "", sortOrder: 3, isActive: true },
  { id: "cat-4", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, name: "Refreshers", image: "", sortOrder: 4, isActive: true },
  { id: "cat-5", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, name: "Frappe & Smoothies", image: "", sortOrder: 5, isActive: true },
  { id: "cat-6", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, name: "Golden Specials", image: "", sortOrder: 6, isActive: true },
  { id: "moon-cat-1", tenantId: DEVELOPMENT_TENANT_IDS.moonCafe, name: "قهوة مختصة", image: "", sortOrder: 1, isActive: true },
  { id: "moon-cat-2", tenantId: DEVELOPMENT_TENANT_IDS.moonCafe, name: "حلويات", image: "", sortOrder: 2, isActive: true },
];

const image = (id: string) =>
  `https://images.unsplash.com/${id}?w=800&auto=format&fit=crop`;
const goldenProductRows = [
  ["prod-1", "Espresso", "Double-shot espresso made from freshly ground Arabica beans.", 55, "cat-1", image("photo-1510707577719-ae7c14805e3a")],
  ["prod-2", "Americano", "Double espresso gently lengthened with hot filtered water.", 60, "cat-1", image("photo-1509042239860-f550ce710b93")],
  ["prod-3", "Cappuccino", "Espresso, steamed whole milk, and a thick layer of silky milk foam.", 75, "cat-1", image("photo-1572442388796-11668a67e53d")],
  ["prod-4", "Flat White", "Double ristretto with velvety micro-foamed milk.", 80, "cat-1", image("photo-1495474472287-4d71bcdd2085")],
  ["prod-5", "Iced Latte", "Double espresso, chilled milk, ice cubes, and optional vanilla syrup.", 85, "cat-2", image("photo-1517701550927-30cf4ba1dba5")],
  ["prod-6", "Spanish Iced Latte", "Espresso, creamy milk, condensed milk, and ice for a rich sweet finish.", 95, "cat-2", image("photo-1461023058943-07fcbe16d735")],
  ["prod-7", "Iced Caramel Macchiato", "Vanilla syrup, milk, ice, espresso shots, and caramel drizzle.", 105, "cat-2", image("photo-1534687941688-651ccaafbff8")],
  ["prod-8", "Cold Brew", "Arabica coffee slow-steeped for 16 hours, served over ice.", 90, "cat-2", image("photo-1527156231393-7023794f363c")],
  ["prod-9", "Matcha Latte", "Ceremonial matcha powder whisked with milk and a light touch of vanilla.", 95, "cat-3", image("photo-1515823064-d6e0c04616a7")],
  ["prod-10", "Iced Matcha", "Ceremonial matcha, chilled milk, ice, and vanilla syrup.", 100, "cat-3", image("photo-1556881286-fc6915169721")],
  ["prod-11", "Moroccan Mint Tea", "Premium green tea leaves, fresh mint, and your choice of sweetness.", 50, "cat-3", image("photo-1544787219-7f47ccb76574")],
  ["prod-12", "Chai Latte", "Black tea infused with cinnamon, cardamom, ginger, milk, and honey.", 80, "cat-3", image("photo-1571934811356-5cc061b6821f")],
  ["prod-13", "Fresh Lemon Mint", "Fresh lemon juice, muddled mint, cane sugar, sparkling water, and ice.", 70, "cat-4", image("photo-1621263764928-df1444c5e859")],
  ["prod-14", "Mango Passion Refresher", "Mango puree, passion fruit, fresh lemon, sparkling water, and ice.", 85, "cat-4", image("photo-1622597467836-f3285f2131b8")],
  ["prod-15", "Strawberry Mojito", "Fresh strawberries, lime, mint, sparkling water, cane sugar, and crushed ice.", 85, "cat-4", image("photo-1553530666-ba11a7da3888")],
  ["prod-16", "Caramel Coffee Frappe", "Blended espresso, milk, ice, caramel sauce, and whipped cream.", 115, "cat-5", image("photo-1572490122747-3968b75cc699")],
  ["prod-17", "Chocolate Frappe", "Belgian cocoa, milk, ice, chocolate sauce, and whipped cream.", 110, "cat-5", image("photo-1577805947697-89e18249d767")],
  ["prod-18", "Berry Smoothie", "Strawberries, blueberries, banana, yogurt, honey, and crushed ice.", 105, "cat-5", image("photo-1505252585461-04db1eb84625")],
  ["prod-19", "Golden Drip Signature", "Double espresso, date syrup, cinnamon, oat milk, and a delicate sesame crunch.", 120, "cat-6", image("photo-1514432324607-a09d9b4aefdd")],
  ["prod-20", "Golden Hot Chocolate", "Belgian dark chocolate, steamed milk, vanilla, whipped cream, and cocoa dust.", 95, "cat-6", image("photo-1542990253-0d0f5be5f0ed")],
] as const;

export const developmentProducts: Product[] = [
  ...goldenProductRows.map(([id, name, description, price, categoryId, productImage]) => ({
    id,
    tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip,
    name,
    description,
    price,
    image: productImage,
    categoryId,
    isAvailable: true,
  })),
  { id: "moon-prod-1", tenantId: DEVELOPMENT_TENANT_IDS.moonCafe, name: "لاتيه فانيليا", description: "إسبريسو مع حليب وفانيليا", price: 78, categoryId: "moon-cat-1", isAvailable: true },
  { id: "moon-prod-2", tenantId: DEVELOPMENT_TENANT_IDS.moonCafe, name: "قهوة اليوم", description: "قهوة مقطرة حسب التحميص المتاح", price: 65, categoryId: "moon-cat-1", isAvailable: true },
  { id: "moon-prod-3", tenantId: DEVELOPMENT_TENANT_IDS.moonCafe, name: "تشيز كيك التوت", description: "قطعة تشيز كيك مع صوص التوت", price: 110, categoryId: "moon-cat-2", isAvailable: true },
];

export const developmentMenus: Menu[] = [
  { id: "menu-golden-cairo", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, name: "منيو القاهرة", description: "أسعار فرع كفر الشيخ", status: "ACTIVE", createdAt: timestamp, updatedAt: timestamp },
  { id: "menu-golden-new-cairo", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, name: "منيو القاهرة الجديدة", description: "منيو إضافية غير مسندة حاليًا", status: "ACTIVE", createdAt: timestamp, updatedAt: timestamp },
  { id: "menu-moon-main", tenantId: DEVELOPMENT_TENANT_IDS.moonCafe, name: "المنيو الرئيسي", status: "ACTIVE", createdAt: timestamp, updatedAt: timestamp },
];

function menuItems(menuId: string, products: Product[], overrides: Record<string, number> = {}): MenuItem[] {
  return products.map((product, index) => ({
    id: `${menuId}-${product.id}`,
    tenantId: product.tenantId ?? "",
    menuId,
    productId: product.id,
    // Product.price is only a development default. MenuItem.price is the sale price.
    price: overrides[product.id] ?? product.price,
    available: true,
    sortOrder: index + 1,
  }));
}
const goldenProducts = developmentProducts.filter((item) => item.tenantId === DEVELOPMENT_TENANT_IDS.goldenDrip);
const moonProducts = developmentProducts.filter((item) => item.tenantId === DEVELOPMENT_TENANT_IDS.moonCafe);
export const developmentMenuItems: MenuItem[] = [
  ...menuItems("menu-golden-cairo", goldenProducts, { "prod-6": 85 }),
  ...menuItems("menu-golden-new-cairo", goldenProducts, { "prod-6": 100 }),
  ...menuItems("menu-moon-main", moonProducts),
];

export const developmentTables: Table[] = [
  ...Array.from({ length: 10 }, (_, index): Table => ({
    id: `tbl-${index + 1}`,
    tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip,
    branchId: "branch-golden-nasr",
    number: index + 1,
    qrCode: `qr-table-${index + 1}`,
    isActive: true,
  })),
  { id: "moon-tbl-1", tenantId: DEVELOPMENT_TENANT_IDS.moonCafe, branchId: "branch-moon-main", number: 1, qrCode: "moon-qr-table-1", isActive: true },
  { id: "moon-tbl-2", tenantId: DEVELOPMENT_TENANT_IDS.moonCafe, branchId: "branch-moon-main", number: 2, qrCode: "moon-qr-table-2", isActive: true },
  { id: "moon-tbl-3", tenantId: DEVELOPMENT_TENANT_IDS.moonCafe, branchId: "branch-moon-main", number: 3, qrCode: "moon-qr-table-3", isActive: true },
];

export const developmentOrders: Order[] = [
  {
    id: "ord-1", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, branchId: "branch-golden-nasr", orderNumber: "ORD-001", tableId: "tbl-5", tableNumber: 5, orderType: "TABLE", source: "QR_MENU", paymentStatus: "PENDING", customerName: "Ahmed", customerNotes: "Near the window", status: "NEW",
    items: [
      { id: "oi-1", productId: "prod-6", productName: "Spanish Iced Latte", unitPrice: 95, quantity: 2, totalPrice: 190, notes: "Extra ice" },
      { id: "oi-2", productId: "offer-1", productName: "Morning Coffee Combo", unitPrice: 120, quantity: 1, totalPrice: 120 },
    ], subtotal: 310, total: 310, createdAt: "2026-08-11T10:00:00.000Z",
  },
  {
    id: "ord-2", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, branchId: "branch-golden-nasr", orderNumber: "ORD-002", tableNumber: 3, orderType: "TAKEAWAY", source: "POS", paymentStatus: "PAID", paymentMethod: "CASH", customerName: "Mona", customerPhone: "01050555375", customerNotes: "Ready in 15 minutes", status: "PREPARING",
    items: [
      { id: "oi-3", productId: "prod-3", productName: "Cappuccino", unitPrice: 75, quantity: 1, totalPrice: 75 },
      { id: "oi-4", productId: "prod-16", productName: "Caramel Coffee Frappe", unitPrice: 115, quantity: 2, totalPrice: 230, notes: "No whipped cream" },
    ], subtotal: 305, total: 305, createdAt: "2026-08-11T09:45:00.000Z",
  },
  {
    id: "ord-3", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, branchId: "branch-golden-nasr", orderNumber: "ORD-003", tableNumber: 8, orderType: "DELIVERY", source: "ONLINE_MENU", paymentStatus: "PAID", paymentMethod: "ONLINE", customerName: "Omar", customerPhone: "01011329575", customerAddress: "El Estad St, behind City Club back gate", customerNotes: "Call on arrival", status: "READY",
    items: [
      { id: "oi-5", productId: "prod-13", productName: "Fresh Lemon Mint", unitPrice: 70, quantity: 2, totalPrice: 140 },
      { id: "oi-6", productId: "prod-10", productName: "Iced Matcha", unitPrice: 100, quantity: 1, totalPrice: 100 },
    ], subtotal: 240, total: 240, createdAt: "2026-08-11T09:15:00.000Z",
  },
  {
    id: "ord-4", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, branchId: "branch-golden-nasr", orderNumber: "ORD-004", tableId: "tbl-2", tableNumber: 2, orderType: "TABLE", source: "POS", paymentStatus: "PAID", paymentMethod: "CARD", customerName: "Sara", status: "COMPLETED",
    items: [
      { id: "oi-7", productId: "prod-19", productName: "Golden Drip Signature", unitPrice: 120, quantity: 1, totalPrice: 120 },
      { id: "oi-8", productId: "offer-3", productName: "Golden Dessert Pair", unitPrice: 135, quantity: 1, totalPrice: 135 },
    ], subtotal: 255, total: 255, createdAt: "2026-08-11T08:00:00.000Z",
  },
  {
    id: "moon-ord-1", tenantId: DEVELOPMENT_TENANT_IDS.moonCafe, branchId: "branch-moon-main", orderNumber: "MOON-101", tableId: "moon-tbl-1", tableNumber: 1, orderType: "TABLE", source: "POS", paymentStatus: "PENDING", customerName: "سارة", status: "PREPARING",
    items: [{ id: "moon-oi-1", productId: "moon-prod-1", productName: "لاتيه فانيليا", unitPrice: 78, quantity: 2, totalPrice: 156 }], subtotal: 156, total: 156, createdAt: "2026-08-11T09:30:00.000Z",
  },
];

export const developmentOffers: Offer[] = [
  { id: "offer-1", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, title: "Morning Coffee Combo", description: "Start your day with any hot coffee and a fresh bakery bite.", image: image("photo-1509042239860-f550ce710b93"), originalPrice: 165, price: 120, isActive: true, sortOrder: 1 },
  { id: "offer-2", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, title: "Iced Drinks Weekend", description: "Cool down with selected iced coffee drinks all weekend.", image: image("photo-1461023058943-07fcbe16d735"), originalPrice: 195, price: 150, isActive: true, sortOrder: 2 },
  { id: "offer-3", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, title: "Golden Dessert Pair", description: "Pair your favorite drink with a rich dessert for a sweet finish.", image: image("photo-1551024601-bec78aea704b"), originalPrice: 175, price: 135, isActive: true, sortOrder: 3 },
  { id: "moon-offer-1", tenantId: DEVELOPMENT_TENANT_IDS.moonCafe, title: "باقة المساء", description: "قهوة اليوم مع قطعة حلوى", image: "", originalPrice: 160, price: 125, isActive: true, sortOrder: 1 },
];

const roleId = (tenantId: string, code: string) => `${tenantId}:role:${code}`;
function rolesFor(tenantId: string): CafeRole[] {
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
  if (tenantId === DEVELOPMENT_TENANT_IDS.goldenDrip) roles.push({
    id: `${tenantId}:role:inventory-controller`, tenantId, name: "مسؤول المخزون", description: "متابعة المخزون والجرد والهالك والمشتريات", systemRole: false,
    permissions: ["dashboard.view", "inventory.view", "inventory.adjust", "inventory.stockCount", "inventory.waste", "purchases.view"], createdAt: timestamp, updatedAt: timestamp,
  });
  return roles;
}
export const developmentRoles = [
  ...rolesFor(DEVELOPMENT_TENANT_IDS.goldenDrip),
  ...rolesFor(DEVELOPMENT_TENANT_IDS.moonCafe),
];

function employee(tenantId: string, id: string, name: string, code: "OWNER" | "MANAGER" | "CASHIER" | "WAITER" | "KITCHEN", email: string, branchAccess: "ALL" | "SELECTED", branchIds: string[]): CafeEmployee {
  return { id: `${tenantId}:employee:${id}`, tenantId, name, phone: "01000000000", email, username: id, roleId: roleId(tenantId, code), branchAccess, branchIds, status: "ACTIVE", joinDate: "2026-01-01", createdAt: timestamp, updatedAt: timestamp };
}
export const developmentEmployees: CafeEmployee[] = [
  employee(DEVELOPMENT_TENANT_IDS.goldenDrip, "owner", "مالك Golden Drip", "OWNER", "owner@golden.demo", "ALL", []),
  employee(DEVELOPMENT_TENANT_IDS.goldenDrip, "manager", "سارة المدير", "MANAGER", "manager@golden-drip.demo", "ALL", []),
  employee(DEVELOPMENT_TENANT_IDS.goldenDrip, "cashier", "أحمد الكاشير", "CASHIER", "cashier@golden-drip.demo", "SELECTED", ["branch-golden-nasr"]),
  employee(DEVELOPMENT_TENANT_IDS.goldenDrip, "waiter", "محمد الويتر", "WAITER", "waiter@golden-drip.demo", "SELECTED", ["branch-golden-nasr"]),
  employee(DEVELOPMENT_TENANT_IDS.goldenDrip, "kitchen", "علي المطبخ", "KITCHEN", "kitchen@golden-drip.demo", "SELECTED", ["branch-golden-nasr"]),
  { ...employee(DEVELOPMENT_TENANT_IDS.goldenDrip, "inventory", "محمود المخزون", "OWNER", "inventory@golden-drip.demo", "SELECTED", ["branch-golden-nasr"]), roleId: `${DEVELOPMENT_TENANT_IDS.goldenDrip}:role:inventory-controller` },
  employee(DEVELOPMENT_TENANT_IDS.moonCafe, "owner", "مالك Moon Café", "OWNER", "owner@moon-cafe.demo", "ALL", []),
  employee(DEVELOPMENT_TENANT_IDS.moonCafe, "cashier", "كاشير Moon Café", "CASHIER", "cashier@moon-cafe.demo", "SELECTED", ["branch-moon-main"]),
];

const emptyOperations = (): Record<OperationResource, OperationRecord[]> => ({
  inventory: [], stockMovements: [], stockCounts: [], waste: [], recipes: [], suppliers: [], purchases: [], expenses: [], customers: [], loyalty: [], coupons: [], deliveryZones: [], payments: [], refunds: [], cashRegister: [], shifts: [], notifications: [], waiterRequests: [], modifierGroups: [], loyaltySettings: [], auditLog: [],
});
export const developmentOperations: Record<string, Record<OperationResource, OperationRecord[]>> = {
  [DEVELOPMENT_TENANT_IDS.goldenDrip]: {
    ...emptyOperations(),
    inventory: [{ id: "inv-coffee", tenantId: DEVELOPMENT_TENANT_IDS.goldenDrip, branchId: "branch-golden-nasr", name: "حبوب أرابيكا", unit: "كجم", quantity: 18, minimumStock: 10, averageCost: 280, active: true, createdAt: timestamp, updatedAt: timestamp }],
  },
  [DEVELOPMENT_TENANT_IDS.moonCafe]: {
    ...emptyOperations(),
    inventory: [{ id: "moon-inv-milk", tenantId: DEVELOPMENT_TENANT_IDS.moonCafe, branchId: "branch-moon-main", name: "حليب كامل الدسم", unit: "لتر", quantity: 24, minimumStock: 8, averageCost: 28, active: true, createdAt: timestamp, updatedAt: timestamp }],
  },
};

export function cloneDevelopmentFixture<T>(value: T): T {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}
export function forTenant<T extends { tenantId?: string }>(records: T[], tenantId: string): T[] {
  return cloneDevelopmentFixture(records.filter((record) => record.tenantId === tenantId));
}
