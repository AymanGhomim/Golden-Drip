"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  showText?: boolean;
}

export function AppLogo({ className, showText = true }: AppLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-14 w-14 shrink-0">
        <Image
          src="/logo-transparent.png"
          alt="Golden Drip Café"
          fill
          sizes="56px"
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="text-xl font-bold text-foreground">
          Golden Drip Café
        </span>
      )}
    </div>
  );
}
