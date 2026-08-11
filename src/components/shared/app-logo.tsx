"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useTenant } from "@/providers/tenant-provider";
import { normalizeTenantBranding } from "@/lib/tenant-branding";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";

interface AppLogoProps { className?: string; showText?: boolean; size?: "sm" | "md"; }

export function AppLogo({ className, showText = true, size = "md" }: AppLogoProps) {
  const { tenant } = useTenant();
  const { resolvedTheme } = useTheme();
  const branding = normalizeTenantBranding(tenant.branding);
  const logo =
    resolvedTheme === "dark"
      ? branding.darkLogo || branding.logo
      : branding.lightLogo || branding.logo;
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [logo]);
  return <div className={cn("flex items-center gap-2", className)}>
    <div className={cn("relative shrink-0", size === "sm" ? "h-10 w-10" : "h-14 w-14")}>
      {logo && !imageFailed ? <Image src={logo} alt={`شعار ${tenant.name}`} fill sizes={size === "sm" ? "40px" : "56px"} className="object-contain" priority onError={() => setImageFailed(true)} /> : <ImagePlaceholder className="h-full w-full rounded-lg" />}
    </div>
    {showText ? <span className={cn("font-bold text-foreground", size === "sm" ? "text-base" : "text-xl")}>{tenant.name}</span> : null}
  </div>;
}
