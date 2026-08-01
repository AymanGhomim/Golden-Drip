"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgePercent,
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  TableProperties,
  Tags,
  X,
} from "lucide-react";

import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminLocale } from "@/providers/admin-locale-provider";
import { useAuthStore } from "@/store/auth.store";

const navigation = [
  { key: "dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { key: "products", href: "/admin/products", icon: Package },
  { key: "categories", href: "/admin/categories", icon: Tags },
  { key: "offers", href: "/admin/offers", icon: BadgePercent },
  { key: "orders", href: "/admin/orders", icon: ClipboardList },
  { key: "tables", href: "/admin/tables", icon: TableProperties },
  { key: "settings", href: "/admin/settings", icon: Settings },
  { key: "kitchen", href: "/kitchen/orders", icon: ChefHat },
] as const;

const copy = {
  en: {
    management: "Management",
    signOut: "Sign out",
    dashboard: "Dashboard",
    products: "Products",
    categories: "Categories",
    offers: "Offers",
    orders: "Orders",
    tables: "Tables",
    settings: "Settings",
    kitchen: "Kitchen",
    back: "Back",
  },
  ar: {
    management: "الإدارة",
    signOut: "تسجيل الخروج",
    dashboard: "لوحة التحكم",
    products: "المنتجات",
    categories: "الأقسام",
    offers: "العروض",
    orders: "الطلبات",
    tables: "الطاولات",
    settings: "الإعدادات",
    kitchen: "المطبخ",
    back: "رجوع",
  },
} as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [ready, setReady] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const { locale } = useAdminLocale();
  const text = copy[locale];

  useEffect(() => {
    void Promise.resolve(useAuthStore.persist.rehydrate()).then(() => setReady(true));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const hadDarkClass = root.classList.contains("dark");
    const previousColorScheme = root.style.colorScheme;

    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";

    return () => {
      root.classList.remove("light");
      if (hadDarkClass) root.classList.add("dark");
      root.style.colorScheme = previousColorScheme;
    };
  }, []);

  useEffect(() => {
    if (ready && !isAuthenticated) router.replace("/admin/login");
  }, [isAuthenticated, ready, router]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  if (!ready || !isAuthenticated) return <main className="min-h-screen bg-background" />;

  const renderLinks = (onNavigate?: () => void, collapsed = false) =>
    navigation.map((item) => {
      const Icon = item.icon;
      const active = pathname === item.href;

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          title={collapsed ? text[item.key] : undefined}
          className={cn(
            "group relative flex items-center rounded-lg py-2.5 text-xs font-semibold transition-all duration-200 ease-out",
            collapsed ? "mx-auto h-11 w-11 justify-center px-0 py-0" : "gap-3 px-3",
            active
              ? "bg-[hsl(30_33%_84%)] text-[#21100a] shadow-[0_10px_22px_rgba(0,0,0,0.16)]"
              : "text-[#cdb5a5] hover:bg-white/10 hover:text-[#fff5ee]"
          )}
        >
          <span
            className={cn(
              "absolute inset-y-2 w-1 rounded-full bg-accent opacity-0 transition-opacity duration-200",
              locale === "ar" ? (collapsed ? "-right-2" : "right-0") : collapsed ? "-left-2" : "left-0",
              active && "opacity-100"
            )}
          />
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-md transition-colors duration-200",
              collapsed ? "h-8 w-8" : "h-7 w-7",
              active ? "bg-[#21100a]/10" : "bg-white/5 group-hover:bg-white/10"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          {collapsed ? null : <span className="truncate">{text[item.key]}</span>}
        </Link>
      );
    });

  return (
    <div className="min-h-screen bg-background lg:flex" dir={locale === "ar" ? "rtl" : "ltr"}>
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[#3d2014] bg-[#21100a] shadow-[8px_0_28px_rgba(0,0,0,0.16)] transition-[width,padding] duration-200 ease-out lg:flex",
          isDesktopSidebarOpen ? "w-64 p-4" : "w-[5.5rem] px-3 py-4"
        )}
      >
        <div
          className={cn(
            "mb-6 flex rounded-lg border border-white/10 bg-white/5",
            isDesktopSidebarOpen ? "items-center justify-between gap-2 p-3" : "flex-col items-center gap-3 px-2 py-3"
          )}
        >
          {isDesktopSidebarOpen ? (
            <Link href="/admin/dashboard" className="min-w-0 [&_span]:text-[#fff5ee]">
              <AppLogo />
            </Link>
          ) : (
            <Link href="/admin/dashboard" className="mx-auto rounded-full bg-white/8 p-1" aria-label="Admin dashboard">
              <AppLogo showText={false} size="sm" />
            </Link>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-[#cdb5a5] hover:bg-white/10 hover:text-[#fff5ee]"
            onClick={() => setIsDesktopSidebarOpen((value) => !value)}
            aria-label={isDesktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={isDesktopSidebarOpen}
          >
            {isDesktopSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
        </div>
        {isDesktopSidebarOpen ? (
          <p className="mb-3 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#a99080]">
            {text.management}
          </p>
        ) : null}
        <nav className={cn("min-h-0 flex-1 overflow-y-auto", isDesktopSidebarOpen ? "space-y-1 pr-1" : "space-y-2")}>{renderLinks(undefined, !isDesktopSidebarOpen)}</nav>
        <div className={cn("mt-4 shrink-0 rounded-lg border border-white/10 bg-white/5", isDesktopSidebarOpen ? "p-3" : "p-2")}>
          {isDesktopSidebarOpen ? (
            <p className="mb-3 truncate text-xs font-medium text-[#cdb5a5]">{user?.email}</p>
          ) : null}
          <Button
            variant="outline"
            size={isDesktopSidebarOpen ? "default" : "icon"}
            className={cn(
              "h-10 rounded-lg border-white/70 bg-white text-xs font-bold text-[#21100a] shadow-sm hover:border-accent/50 hover:bg-[#fff5ee] hover:text-[#21100a]",
              isDesktopSidebarOpen ? "w-full justify-start gap-2.5 px-3" : "w-full justify-center px-0"
            )}
            onClick={() => {
              logout();
              router.replace("/admin/login");
            }}
            aria-label={text.signOut}
          >
            <LogOut className="h-3.5 w-3.5" />
            {isDesktopSidebarOpen ? text.signOut : null}
          </Button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b bg-background/95 px-3 py-2.5 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-3.5 w-3.5" />
              </Button>
              <AppLogo showText={false} />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-red-100 bg-red-50 px-2 text-red-700 hover:bg-red-100 hover:text-red-800"
              onClick={() => {
                logout();
                router.replace("/admin/login");
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>
        {isMobileSidebarOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-label="Close navigation"
            />
            <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-[#3d2014] bg-[#21100a] p-4 shadow-2xl">
              <div className="mb-6 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                <Link
                  href="/admin/dashboard"
                  className="[&_span]:text-[#fff5ee]"
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <AppLogo />
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-[#cdb5a5] hover:bg-white/10 hover:text-[#fff5ee]"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="mb-3 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#a99080]">
                {text.management}
              </p>
              <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
                {renderLinks(() => setIsMobileSidebarOpen(false))}
              </nav>
              <div className="mt-4 shrink-0 rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="mb-3 truncate text-xs font-medium text-[#cdb5a5]">{user?.email}</p>
                <Button
                  variant="outline"
                  className="h-10 w-full justify-start gap-2.5 rounded-lg border-white/70 bg-white px-3 text-xs font-bold text-[#21100a] shadow-sm hover:border-accent/50 hover:bg-[#fff5ee] hover:text-[#21100a]"
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    logout();
                    router.replace("/admin/login");
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {text.signOut}
                </Button>
              </div>
            </aside>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
