"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { AppLogo } from "@/components/shared/app-logo";
import { ContactTicker } from "@/components/shared/contact-ticker";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import type { Locale } from "@/lib/menu-translations";
import { useTenant } from "@/providers/tenant-provider";
import { useCustomerRoute } from "@/providers/customer-route-provider";

interface SiteHeaderProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export function SiteHeader({ locale, onLocaleChange }: SiteHeaderProps) {
  const { tenant } = useTenant();
  const customerRoute = useCustomerRoute();
  const [isCartHydrated, setIsCartHydrated] = useState(false);
  const items = useCartStore((state) => state.items);
  const totalItems = isCartHydrated
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  useEffect(() => {
    void Promise.resolve().then(() => {
      setIsCartHydrated(true);
    });
  }, []);

  const cartHref = customerRoute.href(ROUTES.cart);

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur animate-header-enter">
      <div className="mx-auto flex min-h-[4.75rem] w-full max-w-6xl items-center justify-between gap-2 px-3 py-3.5 sm:min-h-[6rem] sm:gap-6 sm:px-6 sm:py-5">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={customerRoute.href(ROUTES.menu)}
            className="flex min-w-0 items-center gap-2.5 sm:gap-3"
            aria-label={`${tenant.name} menu`}
          >
            <AppLogo
              showText={false}
              size="sm"
              className="mb-0.5 [&_div]:h-12 [&_div]:w-12 sm:[&_div]:h-16 sm:[&_div]:w-16"
            />
            <span className="min-w-0">
              <span className="block whitespace-nowrap text-sm font-black leading-tight text-foreground sm:text-lg">
                {tenant.name}
              </span>
              <span className="mt-1 hidden text-[0.68rem] font-semibold text-muted-foreground sm:block">
                {locale === "ar" ? "القائمة الإلكترونية" : "Digital menu"}
              </span>
            </span>
          </Link>
        </div>
        <div
          dir="ltr"
          className="flex min-w-0 items-center justify-end gap-2 sm:gap-3"
        >
          <Button
            asChild
            className={cn(
              "h-8 gap-1.5 rounded-md px-2.5 text-xs sm:h-11 sm:gap-2 sm:px-3 sm:text-sm",
              locale === "en" ? "order-3" : "order-1",
            )}
          >
            <Link href={cartHref} aria-label="Cart">
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{totalItems}</span>
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-8 w-[4.25rem] justify-between gap-0 rounded-full border-primary/15 bg-card p-0.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-md sm:h-11 sm:w-[5.35rem] sm:p-1",
              locale === "en" ? "order-1" : "order-2",
            )}
            onClick={() => onLocaleChange(locale === "en" ? "ar" : "en")}
            aria-label={
              locale === "en" ? "Switch to Arabic" : "Switch to English"
            }
          >
            <span
              className={cn(
                "flex h-7 w-8 items-center justify-center rounded-full text-[0.68rem] font-bold leading-none transition-colors sm:h-9 sm:w-9 sm:text-xs",
                locale === "en"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              EN
            </span>
            <span
              className={cn(
                "flex h-7 w-8 items-center justify-center rounded-full text-[0.68rem] font-bold leading-none transition-colors sm:h-9 sm:w-9 sm:text-xs",
                locale === "ar"
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              AR
            </span>
          </Button>
        </div>
      </div>
      <ContactTicker locale={locale} />
    </header>
  );
}
