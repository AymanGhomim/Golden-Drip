import type { Tenant } from "@/types/tenant.types";

const baseFeatures = { onlineMenu: true, qrOrdering: true, delivery: true, inventory: true, reports: true };

export const GOLDEN_DRIP_CONTACT: NonNullable<Tenant["contact"]> = {
  phone: "01050555375",
  whatsapp: "01050555375",
  address: "كفر الشيخ، شارع الاستاد أمام بوابة سيتي كلوب الخلفية",
  locationUrl:
    "https://www.google.com/maps/search/?api=1&query=%D9%83%D9%81%D8%B1+%D8%A7%D9%84%D8%B4%D9%8A%D8%AE+%D8%B4%D8%A7%D8%B1%D8%B9+%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%A7%D8%AF+%D8%B3%D9%8A%D8%AA%D9%8A+%D9%83%D9%84%D9%88%D8%A8",
  facebook:
    "https://www.facebook.com/people/Golden-Drip/61581964776493/",
  instagram: "https://www.instagram.com/goldendrip.cafe",
  tiktok: "https://www.tiktok.com/@golden_drip_",
};

export const DEMO_TENANTS: Tenant[] = [
  {
    id: "tenant-golden-drip", slug: "golden-drip", name: "Golden Drip Café", legalName: "Golden Drip Café", status: "ACTIVE", plan: "GROWTH", subscriptionStatus: "ACTIVE", maxBranchesOverride: 1,
    branding: { logo: "/logo-transparent.png", primary: "#32170e", primaryForeground: "#ffffff", secondary: "#8a4a26", secondaryForeground: "#ffffff", accent: "#b47745", accentForeground: "#ffffff", background: "#f5ede5", surface: "#fffaf5", surfaceSecondary: "#f1e5d9", sidebar: "#eadbca", sidebarText: "#5b3524", sidebarActive: "#32170e", sidebarActiveForeground: "#ffffff", textPrimary: "#32170e", textSecondary: "#76665e", muted: "#efe3d7", border: "#d7c0ab", radius: "0.75rem", fontFamily: "Cairo", login: { backgroundColor: "#e9d9c9", welcomeTitle: "مرحبًا بعودتك!", subtitle: "سجّل الدخول لإدارة الكافيه ومتابعة كل شيء بسلاسة.", cardStyle: "solid" }, receipt: { header: "شكرًا لزيارتكم", footer: "نتمنى رؤيتكم قريبًا", showQr: true }, qr: { foregroundColor: "#21100a", title: "افتح المنيو", helperText: "امسح الكود للطلب" } },
    contact: GOLDEN_DRIP_CONTACT,
    settings: { currency: "EGP", currencySymbol: "ج.م", timezone: "Africa/Cairo", locale: "ar", taxRate: 14 }, features: baseFeatures, createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "tenant-moon-cafe", slug: "moon-cafe", name: "Moon Café", status: "TRIAL", plan: "STARTER", subscriptionStatus: "TRIALING",
    branding: { logo: "/moon-cafe.svg", primary: "#17324d", primaryForeground: "#ffffff", secondary: "#2c668f", secondaryForeground: "#ffffff", accent: "#d59b4a", accentForeground: "#17202a", background: "#edf4f7", surface: "#ffffff", surfaceSecondary: "#e3eef3", sidebar: "#dcecf1", sidebarText: "#17324d", sidebarActive: "#17324d", sidebarActiveForeground: "#ffffff", textPrimary: "#17324d", textSecondary: "#557080", muted: "#e5eff3", border: "#bdd4df", radius: "1rem", fontFamily: "Tajawal", login: { backgroundColor: "#dcecf1", welcomeTitle: "أهلًا بك في Moon Café", subtitle: "إدارة يومك تبدأ من هنا.", cardStyle: "solid" }, receipt: { header: "Moon Café", footer: "شكرًا لزيارتكم", showQr: true }, qr: { foregroundColor: "#17324d", title: "قائمة Moon Café", helperText: "امسح الرمز لفتح المنيو" } },
    contact: { phone: "01000000000", address: "القاهرة الجديدة" },
    settings: { currency: "EGP", currencySymbol: "ج.م", timezone: "Africa/Cairo", locale: "ar", taxRate: 14 }, features: baseFeatures, createdAt: "2026-08-01T00:00:00.000Z",
  },
];

export const DEFAULT_TENANT = DEMO_TENANTS[0];
