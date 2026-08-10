"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import {
  normalizeTenantBranding,
  tenantBrandingCssVariables,
} from "@/lib/tenant-branding";
import { useTenant } from "@/providers/tenant-provider";

export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();
  const branding = useMemo(
    () => normalizeTenantBranding(tenant.branding),
    [tenant.branding],
  );
  const style = useMemo(
    () => tenantBrandingCssVariables(branding),
    [branding],
  );

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = new Map<string, string>();
    Object.entries(style).forEach(([property, value]) => {
      previous.set(property, root.style.getPropertyValue(property));
      root.style.setProperty(property, value);
    });
    root.dataset.tenantTheme = tenant.slug;

    return () => {
      previous.forEach((value, property) => {
        if (value) root.style.setProperty(property, value);
        else root.style.removeProperty(property);
      });
      delete root.dataset.tenantTheme;
    };
  }, [style, tenant.slug]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${tenant.name} | إدارة الكافيه`;
    const href = branding.favicon || branding.logo;
    let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const previousIcon = icon?.href;
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    icon.href = href;
    return () => {
      document.title = previousTitle;
      if (previousIcon && icon) icon.href = previousIcon;
    };
  }, [branding.favicon, branding.logo, tenant.name]);

  return (
    <div
      data-tenant={tenant.slug}
      data-tenant-theme="true"
      className="tenant-theme min-h-screen bg-background text-foreground"
      style={style}
    >
      {children}
    </div>
  );
}
