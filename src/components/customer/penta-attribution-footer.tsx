"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";

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
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/50 to-transparent"
      />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-7 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-10">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background p-2 shadow-sm">
              <AppLogo
                showText={false}
                size="md"
                className="[&_div]:h-12 [&_div]:w-12"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-black tracking-tight sm:text-xl">
                {tenant.name}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                المنيو الإلكتروني الرسمي
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
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
            className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/80 p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:w-auto sm:min-w-64"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black">
                <Image
                  src="/logo platform.png"
                  alt="شعار Penta-K"
                  fill
                  sizes="44px"
                  className="object-contain p-1.5"
                />
              </span>
              <span className="min-w-0 text-right">
                <span className="block text-[0.68rem] font-medium text-muted-foreground">
                  تصميم وتطوير
                </span>
                <span className="mt-0.5 block truncate text-sm font-black tracking-wide">
                  Penta-K
                </span>
              </span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
          </Link>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/60 py-4 text-center text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:text-right">
          <p>
            © {currentYear} {tenant.name}. جميع الحقوق محفوظة.
          </p>
          <p>خدمة رقمية أسرع لطلبك اليومي</p>
        </div>
      </div>
    </footer>
  );
}
