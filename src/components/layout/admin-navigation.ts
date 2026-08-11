import {
  BadgePercent,
  BookOpen,
  Boxes,
  ChefHat,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  MapPin,
  Package,
  QrCode,
  ReceiptText,
  Settings,
  ShoppingCart,
  Tags,
  TableProperties,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = { href: string; label: string; icon: LucideIcon };
export type AdminNavGroup = {
  key: string;
  label: string;
  items: AdminNavItem[];
};

export const adminNavigationGroups: AdminNavGroup[] = [
  {
    key: "home",
    label: "الرئيسية",
    items: [
      { href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    ],
  },
  {
    key: "sales",
    label: "المبيعات",
    items: [
      { href: "/admin/pos", label: "نقطة البيع", icon: ShoppingCart },
      { href: "/admin/orders", label: "الطلبات", icon: ClipboardList },
      { href: "/admin/tables", label: "الطاولات", icon: TableProperties },
      { href: "/kitchen/orders", label: "المطبخ", icon: ChefHat },
    ],
  },
  {
    key: "online",
    label: "المنيو الإلكتروني",
    items: [
      {
        href: "/admin/menu-overview",
        label: "نظرة عامة",
        icon: LayoutDashboard,
      },
      { href: "/admin/qr", label: "رموز QR", icon: QrCode },
      {
        href: "/admin/waiter-requests",
        label: "طلبات الويتر",
        icon: ReceiptText,
      },
      {
        href: "/admin/delivery-zones",
        label: "مناطق التوصيل",
        icon: TableProperties,
      },
      { href: "/admin/menu-settings", label: "إعدادات المنيو", icon: Settings },
    ],
  },
  {
    key: "menu",
    label: "إدارة المنيو",
    items: [
      { href: "/admin/products", label: "المنتجات", icon: Package },
      { href: "/admin/categories", label: "الأقسام", icon: Tags },
      { href: "/admin/addons", label: "الإضافات والخيارات", icon: Boxes },
      { href: "/admin/recipes", label: "الوصفات", icon: ReceiptText },
      { href: "/admin/offers", label: "العروض", icon: BadgePercent },
      { href: "/admin/coupons", label: "الكوبونات", icon: Tags },
    ],
  },
  {
    key: "inventory",
    label: "المخزون",
    items: [
      { href: "/admin/inventory", label: "المخزون", icon: Boxes },
      {
        href: "/admin/stock-movements",
        label: "حركات المخزون",
        icon: ReceiptText,
      },
      { href: "/admin/stock-count", label: "الجرد", icon: ClipboardList },
      { href: "/admin/waste", label: "الهالك", icon: X },
    ],
  },
  {
    key: "purchases",
    label: "المشتريات",
    items: [
      { href: "/admin/suppliers", label: "الموردون", icon: Users },
      { href: "/admin/purchases", label: "المشتريات", icon: ReceiptText },
    ],
  },
  {
    key: "customers",
    label: "العملاء",
    items: [
      { href: "/admin/customers", label: "العملاء", icon: Users },
      { href: "/admin/loyalty", label: "نقاط الولاء", icon: BadgePercent },
    ],
  },
  {
    key: "finance",
    label: "المالية",
    items: [
      { href: "/admin/payments", label: "المدفوعات", icon: WalletCards },
      { href: "/admin/refunds", label: "الاسترجاعات", icon: ReceiptText },
      { href: "/admin/expenses", label: "المصروفات", icon: ReceiptText },
      { href: "/admin/cash-register", label: "الخزنة", icon: WalletCards },
      { href: "/admin/shifts", label: "الورديات", icon: ClipboardList },
    ],
  },
  {
    key: "staff",
    label: "الموظفون",
    items: [
      { href: "/admin/employees", label: "الموظفون", icon: Users },
      { href: "/admin/roles", label: "الأدوار والصلاحيات", icon: Users },
    ],
  },
  {
    key: "management",
    label: "الإدارة",
    items: [
      { href: "/admin/branches", label: "الفروع", icon: MapPin },
      { href: "/admin/menus", label: "المنيوهات", icon: BookOpen },
      { href: "/admin/reports", label: "التقارير", icon: FileBarChart },
      { href: "/admin/notifications", label: "الإشعارات", icon: ReceiptText },
      { href: "/admin/activity-log", label: "سجل النشاط", icon: ClipboardList },
      { href: "/admin/settings", label: "الإعدادات", icon: Settings },
    ],
  },
];
