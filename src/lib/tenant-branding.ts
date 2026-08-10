import type { TenantBranding } from "@/types/tenant.types";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const SUPPORTED_FONTS: Record<string, string> = {
  Cairo: '"Cairo", system-ui, sans-serif',
  Tajawal: '"Tajawal", system-ui, sans-serif',
  Almarai: '"Almarai", system-ui, sans-serif',
  Alexandria: '"Alexandria", system-ui, sans-serif',
  system: "system-ui, sans-serif",
};

export const SAFE_TENANT_BRANDING: Required<
  Pick<
    TenantBranding,
    | "logo"
    | "primary"
    | "primaryForeground"
    | "secondary"
    | "secondaryForeground"
    | "accent"
    | "accentForeground"
    | "background"
    | "surface"
    | "surfaceSecondary"
    | "sidebar"
    | "sidebarText"
    | "sidebarActive"
    | "sidebarActiveForeground"
    | "textPrimary"
    | "textSecondary"
    | "muted"
    | "border"
    | "radius"
    | "fontFamily"
  >
> = {
  logo: "/cafe-placeholder.svg",
  primary: "#1F2937",
  primaryForeground: "#FFFFFF",
  secondary: "#E5E7EB",
  secondaryForeground: "#111827",
  accent: "#4B5563",
  accentForeground: "#FFFFFF",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceSecondary: "#F1F5F9",
  sidebar: "#FFFFFF",
  sidebarText: "#1F2937",
  sidebarActive: "#1F2937",
  sidebarActiveForeground: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#64748B",
  muted: "#F1F5F9",
  border: "#D7DEE7",
  radius: "0.75rem",
  fontFamily: "Cairo",
};

function safeColor(value: string | undefined, fallback: string) {
  return value && HEX_COLOR.test(value) ? value.toUpperCase() : fallback;
}

export function getContrastForeground(color: string) {
  const safe = safeColor(color, SAFE_TENANT_BRANDING.primary);
  const red = Number.parseInt(safe.slice(1, 3), 16);
  const green = Number.parseInt(safe.slice(3, 5), 16);
  const blue = Number.parseInt(safe.slice(5, 7), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance > 0.56 ? "#111827" : "#FFFFFF";
}

function safeRadius(value: string | undefined) {
  return value && /^(?:0|\d+(?:\.\d+)?(?:px|rem))$/.test(value)
    ? value
    : SAFE_TENANT_BRANDING.radius;
}

export function normalizeTenantBranding(branding?: Partial<TenantBranding>) {
  const primary = safeColor(branding?.primary, SAFE_TENANT_BRANDING.primary);
  const secondary = safeColor(
    branding?.secondary,
    SAFE_TENANT_BRANDING.secondary,
  );
  const accent = safeColor(branding?.accent, SAFE_TENANT_BRANDING.accent);
  const sidebar = safeColor(branding?.sidebar, SAFE_TENANT_BRANDING.sidebar);
  const sidebarActive = safeColor(branding?.sidebarActive, primary);
  const fontFamily = branding?.fontFamily;

  return {
    ...branding,
    logo: branding?.logo?.trim() || SAFE_TENANT_BRANDING.logo,
    primary,
    primaryForeground: safeColor(
      branding?.primaryForeground,
      getContrastForeground(primary),
    ),
    secondary,
    secondaryForeground: safeColor(
      branding?.secondaryForeground,
      getContrastForeground(secondary),
    ),
    accent,
    accentForeground: safeColor(
      branding?.accentForeground,
      getContrastForeground(accent),
    ),
    background: safeColor(
      branding?.background,
      SAFE_TENANT_BRANDING.background,
    ),
    surface: safeColor(branding?.surface, SAFE_TENANT_BRANDING.surface),
    surfaceSecondary: safeColor(
      branding?.surfaceSecondary,
      branding?.muted || SAFE_TENANT_BRANDING.surfaceSecondary,
    ),
    sidebar,
    sidebarText: safeColor(
      branding?.sidebarText,
      getContrastForeground(sidebar),
    ),
    sidebarActive,
    sidebarActiveForeground: safeColor(
      branding?.sidebarActiveForeground,
      getContrastForeground(sidebarActive),
    ),
    textPrimary: safeColor(
      branding?.textPrimary,
      SAFE_TENANT_BRANDING.textPrimary,
    ),
    textSecondary: safeColor(
      branding?.textSecondary,
      SAFE_TENANT_BRANDING.textSecondary,
    ),
    muted: safeColor(
      branding?.muted,
      branding?.surfaceSecondary || SAFE_TENANT_BRANDING.muted,
    ),
    border: safeColor(branding?.border, SAFE_TENANT_BRANDING.border),
    radius: safeRadius(branding?.radius),
    fontFamily:
      fontFamily && SUPPORTED_FONTS[fontFamily]
        ? fontFamily
        : SAFE_TENANT_BRANDING.fontFamily,
  } satisfies TenantBranding;
}

function hexToHslChannels(hex: string) {
  const red = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const green = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    saturation =
      lightness > 0.5
        ? delta / (2 - max - min)
        : delta / (max + min);
    if (max === red) hue = (green - blue) / delta + (green < blue ? 6 : 0);
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue /= 6;
  }

  return `${Math.round(hue * 360)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

export function tenantBrandingCssVariables(branding?: Partial<TenantBranding>) {
  const value = normalizeTenantBranding(branding);
  const fontStack = SUPPORTED_FONTS[value.fontFamily || "Cairo"];

  return {
    "--tenant-primary": value.primary,
    "--tenant-primary-foreground": value.primaryForeground,
    "--tenant-primary-hover": `color-mix(in srgb, ${value.primary} 88%, black)`,
    "--tenant-secondary": value.secondary,
    "--tenant-secondary-foreground": value.secondaryForeground,
    "--tenant-secondary-hover": `color-mix(in srgb, ${value.secondary} 88%, black)`,
    "--tenant-accent": value.accent,
    "--tenant-accent-foreground": value.accentForeground,
    "--tenant-background": value.background,
    "--tenant-surface": value.surface,
    "--tenant-surface-secondary": value.surfaceSecondary,
    "--tenant-text-primary": value.textPrimary,
    "--tenant-text-secondary": value.textSecondary,
    "--tenant-muted": value.muted,
    "--tenant-border": value.border,
    "--tenant-sidebar": value.sidebar,
    "--tenant-sidebar-foreground": value.sidebarText,
    "--tenant-sidebar-text": value.sidebarText,
    "--tenant-sidebar-active": value.sidebarActive,
    "--tenant-sidebar-active-foreground": value.sidebarActiveForeground,
    "--tenant-sidebar-hover": `color-mix(in srgb, ${value.sidebarActive} 12%, ${value.sidebar})`,
    "--tenant-radius": value.radius,
    "--tenant-font-family": fontStack,
    "--background": hexToHslChannels(value.background),
    "--foreground": hexToHslChannels(value.textPrimary),
    "--card": hexToHslChannels(value.surface),
    "--card-foreground": hexToHslChannels(value.textPrimary),
    "--popover": hexToHslChannels(value.surface),
    "--popover-foreground": hexToHslChannels(value.textPrimary),
    "--primary": hexToHslChannels(value.primary),
    "--primary-foreground": hexToHslChannels(value.primaryForeground || "#FFFFFF"),
    "--secondary": hexToHslChannels(value.secondary),
    "--secondary-foreground": hexToHslChannels(value.secondaryForeground || "#111827"),
    "--muted": hexToHslChannels(value.muted || value.surfaceSecondary || "#F1F5F9"),
    "--muted-foreground": hexToHslChannels(value.textSecondary),
    "--accent": hexToHslChannels(value.accent),
    "--accent-foreground": hexToHslChannels(value.accentForeground || "#FFFFFF"),
    "--border": hexToHslChannels(value.border),
    "--input": hexToHslChannels(value.border),
    "--ring": hexToHslChannels(value.primary),
    "--radius": value.radius,
  } as Record<string, string>;
}

export const TENANT_FONT_OPTIONS = Object.keys(SUPPORTED_FONTS);
