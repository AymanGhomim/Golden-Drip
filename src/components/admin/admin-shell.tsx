"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgePercent,
  ChefHat,
  ClipboardList,
  Languages,
  LayoutDashboard,
  LogOut,
  Package,
  TableProperties,
  Tags,
} from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useAdminLocale } from "@/providers/admin-locale-provider";

const navigation = [
  { key: "dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { key: "products", href: "/admin/products", icon: Package },
  { key: "categories", href: "/admin/categories", icon: Tags },
  { key: "offers", href: "/admin/offers", icon: BadgePercent },
  { key: "orders", href: "/admin/orders", icon: ClipboardList },
  { key: "tables", href: "/admin/tables", icon: TableProperties },
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
    kitchen: "Kitchen",
    language: "Language",
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
    kitchen: "المطبخ",
    language: "اللغة",
  },
} as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [ready, setReady] = useState(false);
  const { locale, setLocale } = useAdminLocale();
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
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#3d2014] bg-[#21100a] p-4 lg:flex">
        <Link href="/admin/dashboard" className="mb-8 [&_span]:text-[#fff5ee]">
          <AppLogo />
        </Link>
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#a99080]">
          {text.management}
        </p>
        <nav className="space-y-1">{links}</nav>
        <div className="mt-auto border-t border-[#3d2014] pt-4">
          <p className="mb-3 truncate px-3 text-sm text-[#a99080]">{user?.email}</p>
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-2">
            <p className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold text-[#f3dfd2]">
              <Languages className="h-3.5 w-3.5" />
              {text.language}
            </p>
            <div className="grid grid-cols-2 gap-1.5" dir="ltr">
              <button
                className={cn(
                  "rounded-lg px-2 py-2 text-xs font-bold transition-colors",
                  locale === "en"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-white/5 text-[#cdb5a5] hover:bg-white/10"
                )}
                onClick={() => setLocale("en")}
              >
                English
              </button>
              <button
                className={cn(
                  "rounded-lg px-2 py-2 text-xs font-bold transition-colors",
                  locale === "ar"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-white/5 text-[#cdb5a5] hover:bg-white/10"
                )}
                onClick={() => setLocale("ar")}
              >
                العربية
              </button>
            </div>
          </div>
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
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => router.back()}
                aria-label="Back"
              >
                <ArrowLeft className={cn("h-4 w-4", locale === "ar" && "rotate-180")} />
              </Button>
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
        <div className="hidden px-4 pt-5 sm:px-6 lg:block">
          <Button
            type="button"
            variant="outline"
            className="gap-2 rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className={cn("h-4 w-4", locale === "ar" && "rotate-180")} />
            {locale === "ar" ? "رجوع" : "Back"}
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
