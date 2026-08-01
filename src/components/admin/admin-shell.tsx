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
  Package,
  Settings,
  TableProperties,
  Tags,
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
  const { locale } = useAdminLocale();
  const text = copy[locale];

  useEffect(() => {
    void Promise.resolve(useAuthStore.persist.rehydrate()).then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready && !isAuthenticated) router.replace("/admin/login");
  }, [isAuthenticated, ready, router]);

  if (!ready || !isAuthenticated) return <main className="min-h-screen bg-background" />;

  const links = navigation.map((item) => {
    const Icon = item.icon;
    const active = pathname === item.href;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-[#cdb5a5] hover:bg-white/10 hover:text-[#fff5ee]"
        )}
      >
        <Icon className="h-4 w-4" />
        {text[item.key]}
      </Link>
    );
  });

  return (
    <div className="min-h-screen bg-background lg:flex" dir={locale === "ar" ? "rtl" : "ltr"}>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#3d2014] bg-[#21100a] p-4 lg:flex">
        <Link href="/admin/dashboard" className="mb-8 [&_span]:text-[#fff5ee]">
          <AppLogo />
        </Link>
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#a99080]">
          {text.management}
        </p>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">{links}</nav>
        <div className="shrink-0 border-t border-[#3d2014] pt-4">
          <p className="mb-3 truncate px-3 text-sm text-[#a99080]">{user?.email}</p>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-[#cdb5a5] hover:bg-white/10 hover:text-[#ffb4a5]"
            onClick={() => {
              logout();
              router.replace("/admin/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            {text.signOut}
          </Button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AppLogo showText={false} />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                router.replace("/admin/login");
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">{links}</nav>
        </header>
        {children}
      </div>
    </div>
  );
}
