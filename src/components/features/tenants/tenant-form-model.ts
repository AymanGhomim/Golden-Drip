import { FEATURE_GROUPS, getEffectiveFeatures } from "@/config/plans.config";
import { SAFE_TENANT_BRANDING } from "@/lib/tenant-branding";
import type { FeatureKey } from "@/types/platform.types";
import type {
  AdminClientMode,
  TenantBranding,
  TenantStatus,
} from "@/types/tenant.types";

export type TenantDraft = {
  name: string;
  slug: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  locationUrl: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerUsername: string;
  ownerPassword: string;
  ownerPasswordConfirm: string;
  logo: string;
  branding: TenantBranding;
  plan: string;
  featureSelectionMode: "PLAN" | "CUSTOM";
  enabledFeatures: FeatureKey[];
  subscriptionType: "TRIAL" | "PAID";
  startsAt: string;
  endsAt: string;
  status: TenantStatus;
  adminClientMode: AdminClientMode;
};

export type UpdateTenantDraft = <K extends keyof TenantDraft>(
  key: K,
  value: TenantDraft[K],
) => void;

export const tenantBrandingColors = [
  "primary",
  "secondary",
  "accent",
  "background",
  "surface",
  "sidebar",
  "sidebarText",
  "textPrimary",
  "textSecondary",
  "border",
] as const;
export const tenantBrandingLabels: Record<
  (typeof tenantBrandingColors)[number],
  string
> = {
  primary: "الأساسي",
  secondary: "الثانوي",
  accent: "الإبراز",
  background: "الخلفية",
  surface: "البطاقات",
  sidebar: "الخلفية الجانبية",
  sidebarText: "نص السايدبار",
  textPrimary: "النص الأساسي",
  textSecondary: "النص الثانوي",
  border: "الحدود",
};
export const tenantFeatureKeys = FEATURE_GROUPS.flatMap((group) =>
  group.items.map((item) => item.key),
);
export const featuresForPlan = (planCode: string) => {
  const effective = getEffectiveFeatures(planCode);
  return tenantFeatureKeys.filter((key) => effective[key]);
};
export const baseTenantBranding: TenantBranding = {
  ...SAFE_TENANT_BRANDING,
  login: {
    backgroundColor: SAFE_TENANT_BRANDING.background,
    welcomeTitle: "مرحبًا بك",
    subtitle: "سجّل الدخول لإدارة كافيهك",
    cardStyle: "solid",
  },
  receipt: { showQr: true },
  qr: {
    foregroundColor: SAFE_TENANT_BRANDING.primary,
    title: "افتح المنيو",
    helperText: "امسح الكود للطلب",
  },
};

export function slugifyTenant(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
