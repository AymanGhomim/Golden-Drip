import { Database, LockKeyhole, Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import type { OperationResource } from "@contracts/cafe-operations.types";
import { allNavigationItems } from "@/navigation";
import { useAppSelector } from "@/store";
import type { DesktopDevelopmentSnapshot, DesktopSession } from "@/types";

export function AccessDeniedPage() {
  return (
    <div className="mx-auto mt-24 max-w-lg rounded-3xl border bg-white p-10 text-center shadow-sm">
      <LockKeyhole className="mx-auto h-12 w-12 text-red-600" />
      <h1 className="mt-5 text-2xl font-black">لا تملك صلاحية الوصول</h1>
      <p className="mt-3 text-sm text-slate-500">
        يتطلب هذا المسار صلاحية أو ميزة غير متاحة لحسابك الحالي.
      </p>
      <Link to="/" className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-2.5 font-bold text-white">
        العودة
      </Link>
    </div>
  );
}

type SourceRecord = Record<string, unknown>;
type Column = {
  label: string;
  key: string;
  get?: (record: SourceRecord) => unknown;
};
type DataRow = { id: string; cells: string[]; search: string };
type ModuleView = {
  description: string;
  columns: Column[];
  records: SourceRecord[];
};

const resourceByPath: Partial<Record<string, OperationResource>> = {
  "/waiter-requests": "waiterRequests",
  "/delivery-zones": "deliveryZones",
  "/addons": "modifierGroups",
  "/recipes": "recipes",
  "/coupons": "coupons",
  "/inventory": "inventory",
  "/stock-movements": "stockMovements",
  "/stock-count": "stockCounts",
  "/waste": "waste",
  "/suppliers": "suppliers",
  "/purchases": "purchases",
  "/customers": "customers",
  "/loyalty": "loyalty",
  "/payments": "payments",
  "/refunds": "refunds",
  "/expenses": "expenses",
  "/cash-register": "cashRegister",
  "/shifts": "shifts",
  "/notifications": "notifications",
  "/activity-log": "auditLog",
};

const preferredFields: Partial<Record<OperationResource, string[]>> = {
  inventory: ["name", "unit", "quantity", "minimumStock", "averageCost", "active"],
  stockMovements: ["inventoryItemId", "type", "quantity", "quantityBefore", "quantityAfter", "createdAt"],
  stockCounts: ["number", "status", "items", "createdAt", "confirmedAt"],
  waste: ["inventoryItemId", "quantity", "unit", "estimatedCost", "reason", "createdAt"],
  recipes: ["productId", "ingredients"],
  suppliers: ["name", "company", "phone", "email", "active"],
  purchases: ["invoiceNumber", "supplierId", "date", "total", "remaining", "status"],
  expenses: ["category", "amount", "date", "paymentMethod", "notes"],
  customers: ["name", "phone", "email", "address", "active"],
  loyalty: ["customerId", "orderId", "points", "type", "createdAt"],
  coupons: ["code", "type", "value", "usageCount", "active", "endDate"],
  deliveryZones: ["name", "fee", "minimumOrder", "estimatedMinutes", "active"],
  payments: ["transactionNumber", "orderId", "amount", "method", "status", "createdAt"],
  refunds: ["orderId", "amount", "type", "reason", "createdAt"],
  cashRegister: ["type", "amount", "reason", "orderId", "createdAt"],
  shifts: ["employeeId", "openingCash", "status", "openedAt", "closedAt", "difference"],
  notifications: ["type", "title", "message", "read", "createdAt"],
  waiterRequests: ["tableNumber", "type", "status", "notes", "createdAt"],
  modifierGroups: ["name", "required", "minSelections", "maxSelections", "options", "active"],
  auditLog: ["module", "action", "description", "userId", "createdAt"],
};

const labels: Record<string, string> = {
  name: "الاسم", description: "الوصف", status: "الحالة", active: "نشط", code: "الكود",
  unit: "الوحدة", quantity: "الكمية", minimumStock: "الحد الأدنى", averageCost: "متوسط التكلفة",
  price: "السعر", defaultPrice: "السعر الافتراضي", menuPrice: "سعر المنيو", category: "القسم",
  sortOrder: "الترتيب", product: "المنتج", menu: "المنيو", available: "متاح", items: "العناصر",
  phone: "الهاتف", email: "البريد", address: "العنوان", company: "الشركة", role: "الدور",
  permissions: "الصلاحيات", branchAccess: "نطاق الفروع", invoiceNumber: "رقم الفاتورة", supplierId: "المورد",
  date: "التاريخ", total: "الإجمالي", remaining: "المتبقي", amount: "المبلغ", method: "الطريقة",
  orderId: "الطلب", transactionNumber: "رقم المعاملة", type: "النوع", reason: "السبب", categoryId: "القسم",
  createdAt: "تاريخ الإنشاء", openedAt: "بداية الوردية", closedAt: "نهاية الوردية", difference: "الفرق",
  openingCash: "رصيد البداية", employeeId: "الموظف", customerId: "العميل", points: "النقاط",
  value: "القيمة", usageCount: "مرات الاستخدام", endDate: "تاريخ الانتهاء", fee: "رسوم التوصيل",
  minimumOrder: "الحد الأدنى", estimatedMinutes: "الوقت المتوقع", inventoryItemId: "عنصر المخزون",
  quantityBefore: "قبل", quantityAfter: "بعد", estimatedCost: "التكلفة", ingredients: "المكونات",
  paymentMethod: "طريقة الدفع", notes: "ملاحظات", title: "العنوان", message: "الرسالة", read: "مقروء",
  tableNumber: "الطاولة", required: "إجباري", minSelections: "الحد الأدنى", maxSelections: "الحد الأقصى",
  options: "الخيارات", module: "الوحدة", action: "الإجراء", userId: "المستخدم", setting: "الإعداد",
};

const descriptions: Record<string, string> = {
  "/tables": "إدارة طاولات الفرع الحالي وحالة رموز QR.",
  "/menu-overview": "المنتجات والأسعار الفعلية من MenuItem.price في منيو الفرع.",
  "/qr": "رموز طاولات الفرع الحالي.",
  "/products": "كتالوج المنتجات المشترك مع Cafe Web.",
  "/categories": "أقسام كتالوج الكافيه وترتيب ظهورها.",
  "/menus": "المنيوهات وأسعار المنتجات المسندة إليها.",
  "/offers": "عروض الكافيه الحالية.",
  "/branches": "بيانات فروع الكافيه المسموح للحساب بعرضها.",
  "/employees": "الموظفون والأدوار ونطاق الوصول للفروع.",
  "/roles": "الأدوار المبنية على الصلاحيات وليست أسماء الأدوار.",
  "/reports": "مصدر التقارير هو نفس الطلبات التشغيلية الحالية.",
  "/settings": "إعدادات Tenant المستخدمة في Web وDesktop.",
};

function asRecords(records: unknown[]): SourceRecord[] {
  return records as SourceRecord[];
}

function columns(keys: string[]): Column[] {
  return keys.map((key) => ({ key, label: labels[key] ?? key }));
}

function moduleView(
  path: string,
  snapshot: DesktopDevelopmentSnapshot,
  session: DesktopSession,
): ModuleView {
  const resource = resourceByPath[path];
  if (resource) {
    const records = asRecords(snapshot.operations[resource]);
    const fields = preferredFields[resource] ?? Object.keys(records[0] ?? {}).filter((key) => !["id", "tenantId", "branchId"].includes(key)).slice(0, 6);
    return {
      description: descriptions[path] ?? "نفس بيانات التطوير المستخدمة في Cafe Web ضمن نطاق الكافيه والفرع الحالي.",
      columns: columns(fields),
      records,
    };
  }

  if (path === "/products") return { description: descriptions[path], columns: columns(["name", "description", "category", "defaultPrice", "available"]), records: snapshot.products.map((product) => ({ ...product, category: snapshot.categories.find((category) => category.id === product.categoryId)?.name ?? "—", defaultPrice: product.price, available: product.isAvailable })) };
  if (path === "/categories") return { description: descriptions[path], columns: columns(["name", "sortOrder", "active"]), records: snapshot.categories.map((category) => ({ ...category, active: category.isActive })) };
  if (path === "/menus") return { description: descriptions[path], columns: columns(["name", "description", "status", "items"]), records: snapshot.menus.map((menu) => ({ ...menu, items: snapshot.rawMenuItems.filter((item) => item.menuId === menu.id).length })) };
  if (path === "/menu-overview") return { description: descriptions[path], columns: columns(["product", "menu", "menuPrice", "available"]), records: snapshot.rawMenuItems.map((item) => ({ ...item, product: snapshot.products.find((product) => product.id === item.productId)?.name ?? item.productId, menu: snapshot.menus.find((menu) => menu.id === item.menuId)?.name ?? item.menuId, menuPrice: item.price })) };
  if (path === "/menu-settings") return { description: "إسناد المنيو لكل فرع وإعدادات الطلب المتاحة.", columns: columns(["name", "menu", "status"]), records: snapshot.branches.map((branch) => ({ ...branch, menu: snapshot.menus.find((menu) => menu.id === branch.menuId)?.name ?? "—" })) };
  if (path === "/tables" || path === "/qr") return { description: descriptions[path] ?? "طاولات ورموز QR للفرع الحالي.", columns: columns(["tableNumber", "code", "active"]), records: snapshot.tables.map((table) => ({ ...table, tableNumber: table.number, code: table.qrCode, active: table.isActive })) };
  if (path === "/offers") return { description: descriptions[path], columns: columns(["title", "description", "price", "active", "sortOrder"]), records: asRecords(snapshot.offers) };
  if (path === "/branches") return { description: descriptions[path], columns: columns(["name", "code", "address", "status", "menu"]), records: snapshot.branches.map((branch) => ({ ...branch, menu: snapshot.menus.find((menu) => menu.id === branch.menuId)?.name ?? "—" })) };
  if (path === "/employees") return { description: descriptions[path], columns: columns(["name", "email", "role", "branchAccess", "status"]), records: snapshot.employees.map((employee) => ({ ...employee, role: snapshot.roles.find((role) => role.id === employee.roleId)?.name ?? "—" })) };
  if (path === "/roles") return { description: descriptions[path], columns: columns(["name", "description", "permissions"]), records: snapshot.roles.map((role) => ({ ...role, permissions: role.permissions.length })) };
  if (path === "/reports") return { description: descriptions[path], columns: columns(["orderId", "type", "status", "total", "createdAt"]), records: snapshot.orders.map((order) => ({ ...order, orderId: order.orderNumber, type: order.orderType })) };
  if (path === "/settings") return { description: descriptions[path], columns: columns(["setting", "value"]), records: Object.entries(session.tenant.settings).map(([setting, value]) => ({ id: setting, setting, value })) };

  return { description: "لا يوجد مصدر بيانات مرتبط بهذه الوحدة.", columns: columns(["name", "status"]), records: [] };
}

function displayValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  if (Array.isArray(value)) return value.length ? `${value.length} عناصر` : "لا يوجد";
  if (typeof value === "number") return value.toLocaleString("ar-EG");
  if (typeof value === "object") return `${Object.keys(value).length} حقول`;
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) return new Date(text).toLocaleString("ar-EG");
  return text;
}

export function ModuleDataPage() {
  const location = useLocation();
  const snapshot = useAppSelector((state) => state.development);
  const session = useAppSelector((state) => state.auth.session);
  const [query, setQuery] = useState("");
  const item = allNavigationItems.find((entry) => entry.path === location.pathname);
  const view = session
    ? moduleView(location.pathname, snapshot, session)
    : null;
  const rows = useMemo<DataRow[]>(
    () =>
      (view?.records ?? []).map((record, index) => {
        const cells = (view?.columns ?? []).map((column) =>
          displayValue(column.get ? column.get(record) : record[column.key]),
        );
        return {
          id: String(record.id ?? `${location.pathname}-${index}`),
          cells,
          search: cells.join(" ").toLowerCase(),
        };
      }),
    [location.pathname, view],
  );
  if (!session || !view) return null;
  const filtered = rows.filter((row) => row.search.includes(query.trim().toLowerCase()));

  return (
    <section dir="rtl" className="mx-auto w-full max-w-[1500px]">
      <div className="mb-5 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-sm">
        <p className="text-xs font-bold text-[var(--brand-accent)]">إدارة الكافيه</p>
        <h1 className="mt-1 text-2xl font-black">{item?.label ?? "الوحدة"}</h1>
        <p className="mt-1 text-sm text-[var(--brand-muted)]">{view.description}</p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Summary label="إجمالي السجلات" value={rows.length} />
        <Summary label="الفرع الحالي" value={session.currentBranch?.name ?? "بدون فرع"} />
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-sm">
        <div className="border-b border-[var(--brand-border)] p-4">
          <div className="relative max-w-xl">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-muted)]" />
            <input
              className="input !mt-0 pr-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="بحث في البيانات"
            />
          </div>
        </div>
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-right text-sm">
              <thead className="bg-black/5">
                <tr>{view.columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-[var(--brand-border)]">
                    {row.cells.map((cell, index) => <td key={`${row.id}-${view.columns[index].key}`} className={index === 0 ? "font-bold" : "text-[var(--brand-muted)]"}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-14 text-center">
            <Database className="mx-auto h-9 w-9 text-[var(--brand-muted)]" />
            <p className="mt-3 font-bold">{rows.length ? "لا توجد نتائج مطابقة" : "لا توجد بيانات مسجلة حتى الآن"}</p>
            <p className="mt-1 text-sm text-[var(--brand-muted)]">تُعرض هنا نفس بيانات التطوير الخاصة بـCafe Web.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 shadow-sm">
      <p className="text-xs text-[var(--brand-muted)]">{label}</p>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}
