"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, ShoppingCart, Sun } from "lucide-react";

import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import type { Locale } from "@/lib/menu-translations";

interface SiteHeaderProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export function SiteHeader({ locale, onLocaleChange }: SiteHeaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isCartHydrated, setIsCartHydrated] = useState(false);
  const items = useCartStore((state) => state.items);
  const totalItems = isCartHydrated
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
    void Promise.resolve(useCartStore.persist.rehydrate()).then(() => {
      setIsCartHydrated(true);
    });
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur animate-header-enter">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link href={ROUTES.menu} className="shrink-0" aria-label="Golden Drip Cafe menu">
            <AppLogo showText={false} size="sm" className="mb-0.5 sm:[&_div]:h-14 sm:[&_div]:w-14" />
          </Link>
        </div>
        <div dir="ltr" className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
          <Button asChild className="h-8 gap-1.5 rounded-md px-2.5 text-xs sm:h-11 sm:gap-2 sm:px-3 sm:text-sm">
            <Link href={ROUTES.cart} aria-label="Cart">
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{totalItems}</span>
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-primary/15 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-md sm:h-11 sm:w-11"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isMounted && resolvedTheme === "dark" ? (
              <Sun className="h-3.5 w-3.5 text-accent sm:h-4 sm:w-4" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-8 gap-0.5 rounded-full border-primary/15 bg-card p-0.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-md sm:h-11 sm:gap-1 sm:p-1"
            onClick={() => onLocaleChange(locale === "en" ? "ar" : "en")}
            aria-label={locale === "en" ? "Switch to Arabic" : "Switch to English"}
          >
            <span className={cn("rounded-full px-1.5 py-1 text-[0.68rem] font-bold transition-colors sm:px-2.5 sm:py-1.5 sm:text-xs", locale === "en" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground")}>EN</span>
            <span className={cn("rounded-full px-1.5 py-1 text-[0.68rem] font-bold transition-colors sm:px-2.5 sm:py-1.5 sm:text-xs", locale === "ar" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground")}>AR</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
