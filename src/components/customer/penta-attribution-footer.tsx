"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, ShieldCheck, Sparkles } from "lucide-react";

import { AppLogo } from "@/components/shared/app-logo";
import { useTenant } from "@/providers/tenant-provider";

const PENTA_WEBSITE = "https://penta-k.com/en";

export function PentaAttributionFooter() {
  const { tenant } = useTenant();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      dir="rtl"
      className="relative z-10 overflow-hidden border-t border-border/70 bg-card text-card-foreground"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_68%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/70 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 py-10 sm:py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background p-1.5 shadow-sm sm:h-16 sm:w-16">
              <AppLogo
                showText={false}
                size="md"
                className="[&_div]:h-11 [&_div]:w-11 sm:[&_div]:h-12 sm:[&_div]:w-12"
              />
            </div>

            <div className="min-w-0 pt-0.5">
              <p className="text-xl font-black tracking-tight sm:text-2xl">
                {tenant.name}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                القائمة الإلكترونية الرسمية
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>تجربة طلب موثوقة وآمنة</span>
              </div>
            </div>
          </div>

          <Link
            href={PENTA_WEBSITE}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="زيارة الموقع الرسمي لشركة Penta-K"
            className="group relative flex w-full items-center justify-between gap-5 overflow-hidden rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg sm:min-w-[19rem]"
          >
            <span
              aria-hidden="true"
              className="absolute -left-8 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-transform duration-300 group-hover:scale-150"
            />
            <span className="relative flex min-w-0 items-center gap-3">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black shadow-sm">
                <Image
                  src="/logo platform.png"
                  alt="شعار Penta-K"
                  fill
                  sizes="44px"
                  className="object-contain p-1.5"
                />
              </span>
              <span className="min-w-0 text-right">
                <span className="flex items-center gap-1.5 text-[0.68rem] font-medium text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  تصميم وتطوير
                </span>
                <span className="mt-0.5 block truncate text-sm font-black tracking-wide">
                  Penta-K
                </span>
              </span>
            </span>
            <ArrowUpLeft className="relative h-5 w-5 shrink-0 text-muted-foreground transition-all duration-200 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
          </Link>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/60 py-4 text-center text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:text-right">
          <p>© {currentYear} {tenant.name}. جميع الحقوق محفوظة.</p>
          <p>خدمة رقمية أسرع لطلبك اليومي</p>
        </div>
      </div>
    </footer>
  );
}
