"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useTenant } from "@/providers/tenant-provider";
import { normalizeTenantBranding } from "@/lib/tenant-branding";

interface AppLogoProps { className?: string; showText?: boolean; size?: "sm" | "md"; }

export function AppLogo({ className, showText = true, size = "md" }: AppLogoProps) {
  const { tenant } = useTenant();
  const { resolvedTheme } = useTheme();
  const branding = normalizeTenantBranding(tenant.branding);
  const logo =
    resolvedTheme === "dark"
      ? branding.darkLogo || branding.logo
      : branding.lightLogo || branding.logo;
  return <div className={cn("flex items-center gap-2", className)}>
    <div className={cn("relative shrink-0", size === "sm" ? "h-10 w-10" : "h-14 w-14")}>
      <Image src={logo} alt={tenant.name} fill sizes={size === "sm" ? "40px" : "56px"} className="object-contain" priority />
    </div>
    {showText ? <span className={cn("font-bold text-foreground", size === "sm" ? "text-base" : "text-xl")}>{tenant.name}</span> : null}
  </div>;
}
