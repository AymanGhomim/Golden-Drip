"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
  locale?: "en" | "ar";
}

const loadingMessage = {
  en: "Loading...",
  ar: "جاري التحميل...",
} as const;

export function LoadingState({ message, className, locale }: LoadingStateProps) {
  const [detectedLocale, setDetectedLocale] = useState<"en" | "ar">(locale ?? "en");

  useEffect(() => {
    if (locale) {
      setDetectedLocale(locale);
      return;
    }

    const savedLocale = window.localStorage.getItem("golden-drip-locale");
    setDetectedLocale(savedLocale === "ar" ? "ar" : "en");
  }, [locale]);

  const activeLocale = locale ?? detectedLocale;

  return (
    <div
      className={cn("flex flex-col items-center justify-center py-12", className)}
      dir={activeLocale === "ar" ? "rtl" : "ltr"}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-2 text-sm text-muted-foreground">
        {message ?? loadingMessage[activeLocale]}
      </p>
    </div>
  );
}
