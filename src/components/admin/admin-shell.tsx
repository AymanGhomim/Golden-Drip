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
  const { locale } = useAdminLocale();
  const text = copy[locale];

  useEffect(() => {
    void Promise.resolve(useAuthStore.persist.rehydrate()).then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready && !isAuthenticated) router.replace("/admin/login");
  }, [isAuthenticated, ready, router]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  if (!ready || !isAuthenticated) return <main className="min-h-screen bg-background" />;

  const renderLinks = (onNavigate?: () => void) =>
    navigation.map((item) => {
      const Icon = item.icon;
      const active = pathname === item.href;

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
            active
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-[#cdb5a5] hover:bg-white/10 hover:text-[#fff5ee]"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {text[item.key]}
        </Link>
      );
    });

  return (
    <div className="min-h-screen bg-background lg:flex" dir={locale === "ar" ? "rtl" : "ltr"}>
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-[#3d2014] bg-[#21100a] p-3 lg:flex">
        <Link href="/admin/dashboard" className="mb-6 [&_span]:text-[#fff5ee]">
          <AppLogo />
        </Link>
        <p className="mb-2 px-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#a99080]">
          {text.management}
        </p>
        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">{renderLinks()}</nav>
        <div className="shrink-0 border-t border-[#3d2014] pt-3">
          <p className="mb-2 truncate px-2.5 text-xs text-[#a99080]">{user?.email}</p>
          <Button
            variant="outline"
            className="h-9 w-full justify-start gap-2.5 border-white/70 bg-white px-2.5 text-xs font-bold text-[#21100a] shadow-sm hover:border-accent/50 hover:bg-[#fff5ee] hover:text-[#21100a]"
            onClick={() => {
              logout();
              router.replace("/admin/login");
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            {text.signOut}
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
            <aside className="relative flex h-full w-64 max-w-[85vw] flex-col border-r border-[#3d2014] bg-[#21100a] p-3 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
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
              <p className="mb-2 px-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#a99080]">
                {text.management}
              </p>
              <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
                {renderLinks(() => setIsMobileSidebarOpen(false))}
              </nav>
              <div className="shrink-0 border-t border-[#3d2014] pt-3">
                <p className="mb-2 truncate px-2.5 text-xs text-[#a99080]">{user?.email}</p>
                <Button
                  variant="outline"
                  className="h-9 w-full justify-start gap-2.5 border-white/70 bg-white px-2.5 text-xs font-bold text-[#21100a] shadow-sm hover:border-accent/50 hover:bg-[#fff5ee] hover:text-[#21100a]"
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
