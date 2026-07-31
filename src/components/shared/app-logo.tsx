"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md";
}

export function AppLogo({ className, showText = true, size = "md" }: AppLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative shrink-0", size === "sm" ? "h-10 w-10" : "h-14 w-14")}>
        <Image
          src="/logo-transparent.png"
          alt="Golden Drip Café"
          fill
          sizes={size === "sm" ? "40px" : "56px"}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={cn("font-bold text-foreground", size === "sm" ? "text-base" : "text-xl")}>
          Golden Drip Café
        </span>
      )}
    </div>
  );
}
