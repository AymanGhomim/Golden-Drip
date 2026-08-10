import type {
  PermissionDefinition,
  PermissionKey,
} from "@/types/access-control.types";

type PermissionSeed = [PermissionKey, string, string];
const groups: { key: string; label: string; permissions: PermissionSeed[] }[] =
  [
    {
      key: "dashboard",
      label: "لوحة التحكم",
      permissions: [
        [
          "dashboard.view",
          "عرض لوحة التحكم",
          "عرض ملخص التشغيل والاختصارات المسموحة",
        ],
      ],
    },
    {
      key: "pos",
      label: "نقطة البيع",
      permissions: [
        ["pos.use", "استخدام نقطة البيع", "فتح وتشغيل شاشة نقطة البيع"],
      ],
    },
    {
      key: "orders",
      label: "الطلبات",
      permissions: [
        ["orders.view", "عرض الطلبات", "عرض الطلبات وتفاصيلها"],
        ["orders.create", "إنشاء الطلبات", "إضافة طلب جديد"],
        ["orders.update", "تعديل الطلبات", "تعديل بيانات وحالة الطلب"],
        ["orders.cancel", "إلغاء الطلبات", "إلغاء الطلبات القائمة"],
        ["orders.refund", "استرجاع الطلبات", "إنشاء استرجاع للطلب"],
        ["orders.print", "طباعة الطلبات", "طباعة الفاتورة أو الطلب"],
      ],
    },
    {
      key: "products",
      label: "المنتجات",
      permissions: [
        ["products.view", "عرض المنتجات", "عرض المنتجات والوصفات والإضافات"],
        ["products.create", "إضافة المنتجات", "إنشاء منتج جديد"],
        ["products.update", "تعديل المنتجات", "تعديل بيانات المنتجات"],
        ["products.delete", "حذف المنتجات", "حذف أو تعطيل المنتجات"],
      ],
    },
    {
      key: "categories",
      label: "الأقسام",
      permissions: [
        ["categories.view", "عرض الأقسام", "عرض أقسام المنيو"],
        ["categories.manage", "إدارة الأقسام", "إضافة وتعديل وحذف الأقسام"],
      ],
    },
    {
      key: "menus",
      label: "المنيو",
      permissions: [
        ["menus.view", "عرض المنيوهات", "عرض المنيو الإلكتروني والمنيوهات"],
        ["menus.manage", "إدارة المنيوهات", "تعديل المنيو وإعداداته"],
      ],
    },
    {
      key: "branches",
      label: "الفروع",
      permissions: [
        ["branches.view", "عرض الفروع", "عرض بيانات الفروع"],
        ["branches.manage", "إدارة الفروع", "إضافة وتعديل وتعطيل الفروع"],
      ],
    },
    {
      key: "tables",
      label: "الطاولات",
      permissions: [
        ["tables.view", "عرض الطاولات", "عرض الطاولات والجلسات"],
        ["tables.manage", "إدارة الطاولات", "إضافة وتعديل الطاولات"],
      ],
    },
    {
      key: "waiterRequests",
      label: "طلبات الويتر",
      permissions: [
        [
          "waiterRequests.view",
          "عرض طلبات الويتر",
          "عرض طلبات الخدمة الخاصة بالفرع",
        ],
        [
          "waiterRequests.manage",
          "إدارة طلبات الويتر",
          "استلام طلبات الخدمة وإكمالها",
        ],
      ],
    },
    {
      key: "qr",
      label: "رموز QR",
      permissions: [
        ["qr.view", "عرض رموز QR", "عرض رموز الطاولات"],
        ["qr.manage", "إدارة رموز QR", "إنشاء وطباعة رموز QR"],
      ],
    },
    {
      key: "kitchen",
      label: "المطبخ",
      permissions: [
        ["kitchen.view", "عرض شاشة المطبخ", "عرض طلبات المطبخ"],
        ["kitchen.update", "تحديث طلبات المطبخ", "تغيير حالة التحضير"],
      ],
    },
    {
      key: "inventory",
      label: "المخزون",
      permissions: [
        ["inventory.view", "عرض المخزون", "عرض العناصر والأرصدة"],
        ["inventory.create", "إضافة عنصر مخزون", "إنشاء عناصر مخزون"],
        ["inventory.adjust", "تسوية المخزون", "تنفيذ حركات التسوية"],
        ["inventory.stockCount", "إجراء الجرد", "إنشاء وتأكيد الجرد"],
        ["inventory.waste", "تسجيل الهالك", "إنشاء سجلات الهالك"],
      ],
    },
    {
      key: "purchases",
      label: "المشتريات",
      permissions: [
        ["purchases.view", "عرض المشتريات", "عرض فواتير الشراء"],
        ["purchases.create", "إضافة مشتريات", "إنشاء فاتورة شراء"],
        ["purchases.update", "تعديل المشتريات", "تعديل فواتير الشراء"],
        [
          "purchases.receive",
          "استلام المشتريات",
          "استلام الفاتورة وتحديث المخزون",
        ],
      ],
    },
    {
      key: "suppliers",
      label: "الموردون",
      permissions: [
        ["suppliers.view", "عرض الموردين", "عرض بيانات الموردين"],
        ["suppliers.manage", "إدارة الموردين", "إضافة وتعديل الموردين"],
      ],
    },
    {
      key: "customers",
      label: "العملاء",
      permissions: [
        ["customers.view", "عرض العملاء", "عرض ملفات العملاء"],
        ["customers.manage", "إدارة العملاء", "إضافة وتعديل العملاء"],
      ],
    },
    {
      key: "loyalty",
      label: "الولاء",
      permissions: [
        ["loyalty.view", "عرض نقاط الولاء", "عرض أرصدة الولاء"],
        ["loyalty.manage", "إدارة الولاء", "تعديل نقاط وبرنامج الولاء"],
      ],
    },
    {
      key: "coupons",
      label: "الكوبونات",
      permissions: [
        ["coupons.view", "عرض الكوبونات والعروض", "عرض الكوبونات والعروض"],
        [
          "coupons.manage",
          "إدارة الكوبونات والعروض",
          "إضافة وتعديل الكوبونات والعروض",
        ],
      ],
    },
    {
      key: "delivery",
      label: "التوصيل",
      permissions: [
        ["deliveryZones.view", "عرض مناطق التوصيل", "عرض المناطق والرسوم"],
        ["deliveryZones.manage", "إدارة مناطق التوصيل", "إضافة وتعديل المناطق"],
      ],
    },
    {
      key: "finance",
      label: "المالية",
      permissions: [
        ["payments.view", "عرض المدفوعات", "عرض معاملات الدفع"],
        ["refunds.view", "عرض الاسترجاعات", "عرض سجل الاسترجاعات"],
        ["refunds.create", "إنشاء استرجاع", "تنفيذ عملية استرجاع"],
        ["expenses.view", "عرض المصروفات", "عرض سجل المصروفات"],
        ["expenses.create", "إضافة مصروف", "تسجيل مصروف جديد"],
        ["expenses.update", "تعديل المصروفات", "تعديل المصروفات"],
        ["expenses.delete", "حذف المصروفات", "حذف سجل مصروف"],
        ["cashRegister.view", "عرض الخزنة", "عرض حركة الخزنة"],
        ["cashRegister.manage", "إدارة الخزنة", "تنفيذ إدخال وإخراج نقدي"],
        ["shifts.view", "عرض الورديات", "عرض الورديات"],
        ["shifts.open", "فتح وردية", "بدء وردية جديدة"],
        ["shifts.close", "إغلاق وردية", "إغلاق الوردية الحالية"],
      ],
    },
    {
      key: "employees",
      label: "الموظفون",
      permissions: [
        ["employees.view", "عرض الموظفين", "عرض بيانات الموظفين"],
        ["employees.create", "إضافة موظفين", "إنشاء موظف جديد"],
        ["employees.update", "تعديل الموظفين", "تعديل الدور والفروع والبيانات"],
        [
          "employees.suspend",
          "إيقاف وتفعيل الموظفين",
          "تغيير حالة حساب الموظف",
        ],
      ],
    },
    {
      key: "roles",
      label: "الأدوار والصلاحيات",
      permissions: [
        ["roles.view", "عرض الأدوار", "عرض الأدوار وصلاحياتها"],
        ["roles.manage", "إدارة الأدوار", "إنشاء وتعديل ونسخ وحذف الأدوار"],
      ],
    },
    {
      key: "management",
      label: "الإدارة والمتابعة",
      permissions: [
        ["reports.view", "عرض التقارير", "عرض التقارير التشغيلية والمالية"],
        ["notifications.view", "عرض الإشعارات", "عرض إشعارات الكافيه"],
        ["notifications.manage", "إدارة الإشعارات", "تحديث وحذف الإشعارات"],
        ["audit.view", "عرض سجل النشاط", "عرض عمليات المستخدمين"],
        ["settings.view", "عرض الإعدادات", "فتح إعدادات الكافيه"],
        ["settings.edit", "تعديل الإعدادات", "حفظ تغييرات الإعدادات"],
      ],
    },
  ];

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = groups.flatMap(
  (group) =>
    group.permissions.map(([key, label, description]) => ({
      key,
      label,
      description,
      group: group.key,
      groupLabel: group.label,
    })),
);

export const ALL_PERMISSIONS = PERMISSION_DEFINITIONS.map((item) => item.key);
const without = (...blocked: PermissionKey[]) =>
  ALL_PERMISSIONS.filter((key) => !blocked.includes(key));

export const DEFAULT_ROLE_PERMISSIONS: Record<
  "OWNER" | "MANAGER" | "CASHIER" | "WAITER" | "KITCHEN",
  PermissionKey[]
> = {
  OWNER: ALL_PERMISSIONS,
  MANAGER: without("roles.manage"),
  CASHIER: [
    "dashboard.view",
    "pos.use",
    "orders.view",
    "orders.create",
    "customers.view",
    "customers.manage",
    "payments.view",
    "cashRegister.view",
    "shifts.view",
    "shifts.open",
    "shifts.close",
    "notifications.view",
  ],
  WAITER: [
    "dashboard.view",
    "orders.view",
    "orders.create",
    "tables.view",
    "customers.view",
    "waiterRequests.view",
    "waiterRequests.manage",
    "notifications.view",
  ],
  KITCHEN: [
    "dashboard.view",
    "kitchen.view",
    "kitchen.update",
    "orders.view",
    "notifications.view",
  ],
};

export const PERMISSION_GROUPS = groups.map(({ key, label }) => ({
  key,
  label,
}));

export const ROUTE_PERMISSIONS: Record<string, PermissionKey> = {
  "/admin/dashboard": "dashboard.view",
  "/admin/pos": "pos.use",
  "/admin/orders": "orders.view",
  "/admin/tables": "tables.view",
  "/kitchen/orders": "kitchen.view",
  "/admin/menu-overview": "menus.view",
  "/admin/qr": "qr.view",
  "/admin/waiter-requests": "waiterRequests.view",
  "/admin/delivery-zones": "deliveryZones.view",
  "/admin/menu-settings": "menus.manage",
  "/admin/products": "products.view",
  "/admin/categories": "categories.view",
  "/admin/addons": "products.view",
  "/admin/recipes": "products.view",
  "/admin/offers": "coupons.view",
  "/admin/coupons": "coupons.view",
  "/admin/inventory": "inventory.view",
  "/admin/stock-movements": "inventory.view",
  "/admin/stock-count": "inventory.stockCount",
  "/admin/waste": "inventory.waste",
  "/admin/suppliers": "suppliers.view",
  "/admin/purchases": "purchases.view",
  "/admin/customers": "customers.view",
  "/admin/loyalty": "loyalty.view",
  "/admin/payments": "payments.view",
  "/admin/refunds": "refunds.view",
  "/admin/expenses": "expenses.view",
  "/admin/cash-register": "cashRegister.view",
  "/admin/shifts": "shifts.view",
  "/admin/employees": "employees.view",
  "/admin/roles": "roles.view",
  "/admin/branches/new": "branches.manage",
  "/admin/branches": "branches.view",
  "/admin/menus": "menus.view",
  "/admin/reports": "reports.view",
  "/admin/notifications": "notifications.view",
  "/admin/activity-log": "audit.view",
  "/admin/settings": "settings.view",
};

export function getRoutePermission(pathname: string) {
  return Object.entries(ROUTE_PERMISSIONS)
    .sort(([left], [right]) => right.length - left.length)
    .find(
      ([route]) => pathname === route || pathname.startsWith(`${route}/`),
    )?.[1];
}
