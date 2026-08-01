"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/menu-translations";

export function BackButtonRow({ locale }: { locale: Locale }) {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
      <Button
        type="button"
        variant="outline"
        className="gap-2 rounded-full bg-card shadow-sm"
        onClick={() => router.back()}
      >
        <ArrowLeft className={cn("h-4 w-4", locale === "ar" && "rotate-180")} />
        {locale === "ar" ? "رجوع" : "Back"}
      </Button>
    </div>
  );
}
