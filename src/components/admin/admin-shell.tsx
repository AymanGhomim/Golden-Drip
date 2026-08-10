"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgePercent,
  BookOpen,
  Boxes,
  ChefHat,
  ChevronDown,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Tags,
  TableProperties,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTenant } from "@/providers/tenant-provider";
import { useAuthStore } from "@/store/auth.store";
import { getEffectiveFeatures } from "@/config/plans.config";
import { useBranch } from "@/providers/branch-provider";
import { useCurrentEmployee } from "@/providers/current-employee-provider";
import { getRoutePermission } from "@/config/permissions.config";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };
type NavGroup = { key: string; label: string; items: NavItem[] };

const groups: NavGroup[] = [
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
const featureForHref: Record<string, string> = {
  "/admin/pos": "pos",
  "/admin/orders": "orders",
  "/admin/tables": "tables",
  "/kitchen/orders": "kitchen",
  "/admin/qr": "qrOrdering",
  "/admin/delivery-zones": "delivery",
  "/admin/inventory": "inventory",
  "/admin/recipes": "recipes",
  "/admin/suppliers": "suppliers",
  "/admin/purchases": "purchases",
  "/admin/expenses": "expenses",
  "/admin/loyalty": "loyalty",
  "/admin/employees": "employees",
  "/admin/roles": "employees",
  "/admin/reports": "reports",
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { tenant } = useTenant();
  const { branch, branches, setActiveBranch } = useBranch();
  const { employee, role, hasPermission } = useCurrentEmployee();
  const user = useAuthStore((state) => state.user);
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    sales: true,
    menu: true,
  });

  useEffect(() => {
    void Promise.resolve(useAuthStore.persist.rehydrate()).then(() =>
      setReady(true),
    );
  }, []);
  useEffect(() => {
    if (ready && !authenticated) router.replace("/admin/login");
  }, [authenticated, ready, router]);
  useEffect(() => {
    const active = groups.find((group) =>
      group.items.some((item) => pathname === item.href),
    );
    if (active)
      setOpenGroups((current) => ({ ...current, [active.key]: true }));
    setMobileOpen(false);
  }, [pathname]);
  if (!ready || !authenticated)
    return <main className="min-h-screen bg-background" />;
  if (!employee || !role)
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-black">تعذر تحديد حساب الموظف</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            سجّل الدخول مرة أخرى باستخدام حساب موظف تابع لهذا الكافيه.
          </p>
          <Button className="mt-6" onClick={() => { logout(); router.replace("/admin/login"); }}>
            العودة لتسجيل الدخول
          </Button>
        </div>
      </main>
    );
  if (employee.status === "SUSPENDED")
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-black">الحساب موقوف</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            تم إيقاف هذا الحساب. يرجى التواصل مع إدارة الكافيه.
          </p>
          <Button className="mt-6" onClick={() => { logout(); router.replace("/admin/login"); }}>
            تسجيل الخروج
          </Button>
        </div>
      </main>
    );
  if (tenant.status === "SUSPENDED" || tenant.status === "ARCHIVED")
    return (
      <main
        dir="rtl"
        lang="ar"
        className="flex min-h-screen items-center justify-center bg-[var(--tenant-background)] p-6"
      >
        <div className="max-w-md rounded-2xl border border-[var(--tenant-border)] bg-[var(--tenant-surface)] p-8 text-center shadow-lg">
          <AppLogo />
          <h1 className="mt-6 text-2xl font-black">
            {tenant.status === "SUSPENDED" ? "الحساب موقوف" : "انتهى الاشتراك"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            تواصل مع مسؤول المنصة لإعادة تفعيل حساب الكافيه.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              logout();
              router.replace("/admin/login");
            }}
          >
            تسجيل الخروج
          </Button>
        </div>
      </main>
    );

  const signOut = () => {
    logout();
    router.replace("/admin/login");
  };
  const branchSelector = (
    <div className="hidden items-center gap-2 border-b bg-background px-5 py-2 lg:flex">
      <span className="text-xs font-black text-primary">{tenant.name}</span>
      <span className="text-muted-foreground">·</span>
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs font-bold">الفرع الحالي</span>
      {branches.length ? (
        <select
          value={branch?.id ?? ""}
          onChange={(event) => setActiveBranch(event.target.value)}
          className="h-9 min-w-52 rounded-lg border bg-background px-3 text-xs font-bold"
        >
          <option value="" disabled>
            اختر الفرع
          </option>
          {branches
            .filter((item) => item.status === "ACTIVE")
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
        </select>
      ) : (
        <Button asChild size="sm">
          <Link href="/admin/branches/new">إضافة أول فرع</Link>
        </Button>
      )}
    </div>
  );
  const branchRequiredRoutes = [
    "/admin/dashboard",
    "/admin/pos",
    "/admin/orders",
    "/admin/tables",
    "/admin/qr",
    "/admin/inventory",
    "/admin/stock-",
    "/admin/waste",
    "/admin/purchases",
    "/admin/expenses",
    "/admin/payments",
    "/admin/refunds",
    "/admin/cash-register",
    "/admin/shifts",
    "/admin/delivery-zones",
    "/admin/waiter-requests",
    "/kitchen/orders",
  ];
  const requiresBranch = branchRequiredRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const effectiveFeatures = getEffectiveFeatures(
    tenant.plan,
    tenant.featureOverrides,
  );
  const requiredFeature = Object.entries(featureForHref)
    .sort(([left], [right]) => right.length - left.length)
    .find(
      ([href]) => pathname === href || pathname.startsWith(`${href}/`),
    )?.[1];
  const featureUnavailable = Boolean(
    requiredFeature && !effectiveFeatures[requiredFeature],
  );
  const requiredPermission = getRoutePermission(pathname);
  const permissionUnavailable = Boolean(
    requiredPermission && !hasPermission(requiredPermission),
  );
  const page = permissionUnavailable ? (
    <section dir="rtl" className="mx-auto flex min-h-[70vh] max-w-xl items-center px-5">
      <div className="w-full rounded-2xl border border-dashed bg-card p-10 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-black">ليس لديك صلاحية للوصول إلى هذه الصفحة.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          تواصل مع مدير الكافيه إذا كنت تحتاج إلى هذه الصلاحية.
        </p>
      </div>
    </section>
  ) : featureUnavailable ? (
    <section
      dir="rtl"
      className="mx-auto flex min-h-[70vh] max-w-xl items-center px-5"
    >
      <div className="w-full rounded-2xl border border-dashed bg-card p-10 text-center">
        <Package className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-black">
          هذه الميزة غير متاحة في باقتك الحالية
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          يمكنك مراجعة باقتك أو التواصل مع مسؤول المنصة لتفعيل هذه الميزة.
        </p>
      </div>
    </section>
  ) : !branch && requiresBranch ? (
    <section
      dir="rtl"
      className="mx-auto flex min-h-[70vh] max-w-xl items-center px-5"
    >
      <div className="w-full rounded-2xl border border-dashed bg-card p-10 text-center">
        <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-black">
          لم تتم إضافة أي فروع حتى الآن
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          أضف فرعًا أولًا لبدء استخدام هذه الصفحة.
        </p>
        <Button asChild className="mt-6">
          <Link href="/admin/branches/new">إضافة فرع</Link>
        </Button>
      </div>
    </section>
  ) : (
    children
  );
  children = (
    <>
      {branchSelector}
      {page}
    </>
  );
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const feature = featureForHref[item.href];
        const permission = getRoutePermission(item.href);
        return (!feature || effectiveFeatures[feature]) &&
          (!permission || hasPermission(permission));
      }),
    }))
    .filter((group) => group.items.length > 0);
  const navigation = (collapsed: boolean, onNavigate?: () => void) =>
    visibleGroups.map((group) => {
      const open = openGroups[group.key] ?? false;
      return (
        <div key={group.key} className="space-y-1">
          {!collapsed ? (
            <button
              type="button"
              onClick={() =>
                setOpenGroups((current) => ({ ...current, [group.key]: !open }))
              }
              className="flex w-full items-center justify-between px-3 pb-1 pt-3 text-[0.65rem] font-bold tracking-wide text-[var(--tenant-sidebar-foreground)] opacity-70"
            >
              <span>{group.label}</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>
          ) : null}
          {collapsed || open
            ? group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group relative flex items-center rounded-lg py-2.5 text-xs font-semibold transition-all",
                      collapsed
                        ? "mx-auto h-11 w-11 justify-center px-0"
                        : "gap-3 px-3",
                      active
                        ? "bg-[var(--tenant-sidebar-active)] text-[var(--tenant-sidebar-active-foreground)] shadow-md"
                        : "text-[var(--tenant-sidebar-foreground)] hover:bg-[var(--tenant-sidebar-hover)] hover:text-[var(--tenant-sidebar-foreground)]",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute inset-y-2 right-0 w-1 rounded-full bg-[var(--tenant-sidebar-active-foreground)]",
                        !active && "opacity-0",
                      )}
                    />
                    <span
                      className={cn(
                        "flex shrink-0 items-center justify-center rounded-md",
                        collapsed ? "h-8 w-8" : "h-7 w-7",
                        active
                          ? "bg-white/15"
                          : "bg-[var(--tenant-sidebar-hover)]",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {!collapsed ? (
                      <span className="truncate">{item.label}</span>
                    ) : null}
                  </Link>
                );
              })
            : null}
        </div>
      );
    });
  const sidebar = (mobile = false) => (
    <aside
      aria-label={tenant.name}
      style={{
        backgroundColor: "var(--tenant-sidebar)",
        borderColor: "var(--tenant-border)",
      }}
      className={cn(
        "flex h-full flex-col border-l p-4 shadow-2xl",
        mobile ? "w-80 max-w-[88vw]" : desktopOpen ? "w-64" : "w-[5.5rem] px-3",
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-[var(--tenant-border)] bg-[var(--tenant-sidebar-hover)] p-3">
        <Link
          href="/admin/dashboard"
          onClick={() => mobile && setMobileOpen(false)}
        >
          <AppLogo
            showText={desktopOpen || mobile}
            size={desktopOpen || mobile ? "md" : "sm"}
          />
        </Link>
        {!mobile ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-[var(--tenant-sidebar-foreground)] hover:bg-[var(--tenant-sidebar-hover)]"
            onClick={() => setDesktopOpen((value) => !value)}
            aria-label="طي الشريط الجانبي"
          >
            {desktopOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-[var(--tenant-sidebar-foreground)] hover:bg-[var(--tenant-sidebar-hover)]"
            onClick={() => setMobileOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {navigation(
          !mobile && !desktopOpen,
          mobile ? () => setMobileOpen(false) : undefined,
        )}
      </nav>
      <div className="mt-4 shrink-0 rounded-lg border border-[var(--tenant-border)] bg-[var(--tenant-sidebar-hover)] p-3">
        {desktopOpen || mobile ? (
          <div className="mb-3 text-[var(--tenant-sidebar-foreground)]">
            <p className="truncate text-xs font-black">{employee.name}</p>
            <p className="mt-1 truncate text-[11px] opacity-70">{role.name} · {user?.email}</p>
          </div>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={signOut}
          className={cn(
            "h-10 rounded-lg border-[var(--tenant-secondary)] bg-[var(--tenant-surface)] text-xs font-bold text-[var(--tenant-text-primary)]",
            desktopOpen || mobile
              ? "w-full justify-start gap-2.5 px-3"
              : "w-full justify-center px-0",
          )}
        >
          <LogOut className="h-3.5 w-3.5" />
          {desktopOpen || mobile ? "تسجيل الخروج" : null}
        </Button>
      </div>
    </aside>
  );
  return (
    <div dir="rtl" lang="ar" className="min-h-screen bg-background lg:flex">
      <div className="sticky top-0 hidden h-screen shrink-0 lg:flex">
        {sidebar()}
      </div>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/95 px-3 py-2.5 backdrop-blur lg:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setMobileOpen(true)}
            aria-label="فتح القائمة"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <AppLogo showText={false} />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={signOut}
            aria-label="تسجيل الخروج"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        {mobileOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/55"
              onClick={() => setMobileOpen(false)}
              aria-label="إغلاق القائمة"
            />
            <div className="relative h-full">{sidebar(true)}</div>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
