import type { LucideIcon } from "lucide-react";
import { BadgePercent, BarChart3, Bell, BookOpen, Boxes, ChefHat, ClipboardList, CreditCard, FileClock, LayoutDashboard, MapPin, Package, QrCode, Receipt, Settings, ShoppingCart, Tags, Table2, Truck, UserCog, Users, WalletCards } from "lucide-react";
import type { PermissionKey } from "@contracts/access-control.types";
import type { TenantFeatures } from "@contracts/tenant.types";
import type { DesktopSession } from "@/types";
import { canAccess } from "@/auth/access";

export type NavigationItem = { path: string; label: string; icon: LucideIcon; permission?: PermissionKey; feature?: keyof TenantFeatures; real?: boolean };
export type NavigationGroup = { label: string; items: NavigationItem[] };

export const navigationGroups: NavigationGroup[] = [
  { label: "الرئيسية", items: [{ path: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard, permission: "dashboard.view", real: true }] },
  { label: "المبيعات", items: [
    { path: "/pos", label: "نقطة البيع", icon: ShoppingCart, permission: "pos.use", feature: "pos", real: true },
    { path: "/orders", label: "الطلبات", icon: ClipboardList, permission: "orders.view", feature: "orders", real: true },
    { path: "/tables", label: "الطاولات", icon: Table2, permission: "tables.view", feature: "tables" },
    { path: "/kitchen", label: "المطبخ", icon: ChefHat, permission: "kitchen.view", feature: "kitchen", real: true },
  ] },
  { label: "المنيو الإلكتروني", items: [
    { path: "/menu-overview", label: "نظرة عامة", icon: LayoutDashboard, permission: "menus.view", feature: "onlineMenu" },
    { path: "/qr", label: "رموز QR", icon: QrCode, permission: "qr.view", feature: "qrOrdering" },
    { path: "/waiter-requests", label: "طلبات الويتر", icon: Bell, permission: "waiterRequests.view", feature: "qrOrdering" },
    { path: "/delivery-zones", label: "مناطق التوصيل", icon: Truck, permission: "deliveryZones.view", feature: "delivery" },
    { path: "/menu-settings", label: "إعدادات المنيو", icon: Settings, permission: "settings.view", feature: "onlineMenu" },
  ] },
  { label: "المنيو والمنتجات", items: [
    { path: "/products", label: "المنتجات", icon: Package, permission: "products.view" },
    { path: "/categories", label: "الأقسام", icon: Tags, permission: "categories.view" },
    { path: "/menus", label: "المنيوهات", icon: BookOpen, permission: "menus.view" },
    { path: "/addons", label: "الإضافات", icon: Boxes, permission: "products.view" },
    { path: "/recipes", label: "الوصفات", icon: Receipt, permission: "products.view", feature: "recipes" },
    { path: "/offers", label: "العروض", icon: BadgePercent, permission: "coupons.view" },
    { path: "/coupons", label: "الكوبونات", icon: Tags, permission: "coupons.view" },
  ] },
  { label: "التشغيل", items: [
    { path: "/inventory", label: "المخزون", icon: Boxes, permission: "inventory.view", feature: "inventory" },
    { path: "/stock-movements", label: "حركات المخزون", icon: FileClock, permission: "inventory.view", feature: "inventory" },
    { path: "/stock-count", label: "الجرد", icon: ClipboardList, permission: "inventory.stockCount", feature: "inventory" },
    { path: "/waste", label: "الهالك", icon: Receipt, permission: "inventory.waste", feature: "inventory" },
    { path: "/suppliers", label: "الموردون", icon: Truck, permission: "suppliers.view", feature: "suppliers" },
    { path: "/purchases", label: "المشتريات", icon: Receipt, permission: "purchases.view", feature: "purchases" },
  ] },
  { label: "العملاء والمالية", items: [
    { path: "/customers", label: "العملاء", icon: Users, permission: "customers.view" },
    { path: "/loyalty", label: "الولاء", icon: BadgePercent, permission: "loyalty.view", feature: "loyalty" },
    { path: "/payments", label: "المدفوعات", icon: CreditCard, permission: "payments.view" },
    { path: "/refunds", label: "الاسترجاعات", icon: Receipt, permission: "refunds.view" },
    { path: "/expenses", label: "المصروفات", icon: WalletCards, permission: "expenses.view", feature: "expenses" },
    { path: "/cash-register", label: "الخزنة", icon: WalletCards, permission: "cashRegister.view" },
    { path: "/shifts", label: "الورديات", icon: FileClock, permission: "shifts.view" },
  ] },
  { label: "الإدارة", items: [
    { path: "/branches", label: "الفروع", icon: MapPin, permission: "branches.view" },
    { path: "/employees", label: "الموظفون", icon: Users, permission: "employees.view", feature: "employees" },
    { path: "/roles", label: "الصلاحيات", icon: UserCog, permission: "roles.view", feature: "employees" },
    { path: "/reports", label: "التقارير", icon: BarChart3, permission: "reports.view", feature: "reports" },
    { path: "/notifications", label: "الإشعارات", icon: Bell, permission: "notifications.view" },
    { path: "/activity-log", label: "سجل النشاط", icon: FileClock, permission: "audit.view" },
    { path: "/settings", label: "الإعدادات", icon: Settings, permission: "settings.view" },
  ] },
];

export const allNavigationItems = navigationGroups.flatMap((group) => group.items);
export const firstAccessibleRoute = (session: DesktopSession) => allNavigationItems.find((item) => canAccess(session, item))?.path ?? "/access-denied";
