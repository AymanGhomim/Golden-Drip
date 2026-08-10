"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  FileQuestion,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { PlatformLogo } from "@/components/platform/platform-logo";
import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StateVariant = "neutral" | "platform" | "cafe";

const styles: Record<
  StateVariant,
  {
    page: string;
    card: string;
    icon: string;
    text: string;
    muted: string;
    button: string;
  }
> = {
  neutral: {
    page: "bg-slate-50",
    card: "border-slate-200 bg-white",
    icon: "bg-slate-100 text-slate-700",
    text: "text-slate-950",
    muted: "text-slate-600",
    button: "bg-slate-950 text-white hover:bg-slate-800",
  },
  platform: {
    page: "bg-[#F5F5F5]",
    card: "border-[#D1D5DB] bg-white",
    icon: "bg-[#111111] text-white",
    text: "text-[#111111]",
    muted: "text-[#667085]",
    button: "bg-[#111111] text-white hover:bg-[#374151]",
  },
  cafe: {
    page: "bg-[var(--tenant-background)]",
    card:
      "border-[var(--tenant-border)] bg-[var(--tenant-surface)]",
    icon: "bg-[var(--tenant-primary)] text-white",
    text: "text-[var(--tenant-text-primary)]",
    muted: "text-[var(--tenant-text-secondary)]",
    button:
      "bg-[var(--tenant-primary)] text-white hover:opacity-90",
  },
};

function Brand({ variant }: { variant: StateVariant }) {
  if (variant === "platform") return <PlatformLogo />;
  if (variant === "cafe") return <AppLogo />;

  return (
    <div className="text-sm font-black tracking-wide text-slate-900">
      نظام إدارة التطبيقات
    </div>
  );
}

function Frame({
  variant,
  children,
  fullScreen = false,
}: {
  variant: StateVariant;
  children: React.ReactNode;
  fullScreen?: boolean;
}) {
  const theme = styles[variant];

  return (
    <main
      dir="rtl"
      lang="ar"
      className={cn(
        "flex items-center justify-center p-5",
        fullScreen ? "min-h-screen" : "min-h-[70vh]",
        theme.page,
      )}
    >
      <section
        className={cn(
          "w-full max-w-lg rounded-3xl border p-7 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:p-10",
          theme.card,
        )}
      >
        {children}
      </section>
    </main>
  );
}

export function AppLoadingState({
  variant,
  title,
  fullScreen,
}: {
  variant: StateVariant;
  title: string;
  fullScreen?: boolean;
}) {
  const theme = styles[variant];

  return (
    <Frame variant={variant} fullScreen={fullScreen}>
      <div className="flex justify-center">
        <Brand variant={variant} />
      </div>
      <div
        className={cn(
          "mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-2xl",
          theme.icon,
        )}
      >
        <LoaderCircle className="h-8 w-8 animate-spin" aria-hidden="true" />
      </div>
      <h1 className={cn("mt-6 text-xl font-black", theme.text)}>{title}</h1>
      <p className={cn("mt-2 text-sm", theme.muted)}>
        يرجى الانتظار لحظات...
      </p>
      <span className="sr-only" role="status">
        {title}
      </span>
    </Frame>
  );
}

export function AppErrorState({
  variant,
  reset,
  backHref,
  backLabel,
  fullScreen,
}: {
  variant: StateVariant;
  reset: () => void;
  backHref: string;
  backLabel: string;
  fullScreen?: boolean;
}) {
  const theme = styles[variant];

  return (
    <Frame variant={variant} fullScreen={fullScreen}>
      <div className="flex justify-center">
        <Brand variant={variant} />
      </div>
      <div
        className={cn(
          "mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-2xl",
          theme.icon,
        )}
      >
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className={cn("mt-6 text-2xl font-black", theme.text)}>
        حدث خطأ غير متوقع
      </h1>
      <p className={cn("mx-auto mt-3 max-w-sm text-sm leading-7", theme.muted)}>
        حاول مرة أخرى، وإذا استمرت المشكلة ارجع إلى الصفحة الرئيسية.
      </p>
      <div className="mt-7 flex flex-col-reverse justify-center gap-3 sm:flex-row">
        <Button asChild variant="outline" className="h-11 rounded-xl">
          <Link href={backHref}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
        <Button
          type="button"
          onClick={reset}
          className={cn("h-11 rounded-xl", theme.button)}
        >
          <RotateCcw className="ml-2 h-4 w-4" />
          إعادة المحاولة
        </Button>
      </div>
    </Frame>
  );
}

export function AppNotFoundState({
  variant,
  description,
  actionHref,
  actionLabel,
  fullScreen,
}: {
  variant: StateVariant;
  description: string;
  actionHref: string;
  actionLabel: string;
  fullScreen?: boolean;
}) {
  const theme = styles[variant];

  return (
    <Frame variant={variant} fullScreen={fullScreen}>
      <div className="flex justify-center">
        <Brand variant={variant} />
      </div>
      <div
        className={cn(
          "mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-2xl",
          theme.icon,
        )}
      >
        <FileQuestion className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className={cn("mt-6 text-2xl font-black", theme.text)}>
        الصفحة غير موجودة
      </h1>
      <p className={cn("mx-auto mt-3 max-w-sm text-sm leading-7", theme.muted)}>
        {description}
      </p>
      <Button asChild className={cn("mt-7 h-11 rounded-xl", theme.button)}>
        <Link href={actionHref}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          {actionLabel}
        </Link>
      </Button>
    </Frame>
  );
}
