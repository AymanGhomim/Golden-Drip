import type { FeatureKey, Plan } from "@/types/platform.types";
import type { TenantFeatures } from "@/types/tenant.types";

export const FEATURE_GROUPS: {
  title: string;
  items: { key: FeatureKey; name: string; description: string }[];
}[] = [
  {
    title: "المبيعات",
    items: [
      {
        key: "pos",
        name: "نقطة البيع",
        description: "تشغيل الكاشير وإتمام الطلبات",
      },
      { key: "orders", name: "الطلبات", description: "إدارة دورة الطلب كاملة" },
      {
        key: "tables",
        name: "الطاولات",
        description: "إدارة الجلسات والطاولات",
      },
      { key: "qrOrdering", name: "طلبات QR", description: "استقبال طلبات QR" },
      { key: "kitchen", name: "المطبخ", description: "شاشة تحضير الطلبات" },
      { key: "takeaway", name: "تيك أواي", description: "طلبات الاستلام" },
      { key: "delivery", name: "التوصيل", description: "مناطق ورسوم التوصيل" },
    ],
  },
  {
    title: "الإدارة",
    items: [
      { key: "inventory", name: "المخزون", description: "الأرصدة والتنبيهات" },
      {
        key: "recipes",
        name: "الوصفات",
        description: "حساب مكونات وتكلفة المنتجات",
      },
      { key: "suppliers", name: "الموردون", description: "ملفات الموردين" },
      {
        key: "purchases",
        name: "المشتريات",
        description: "أوامر وفواتير الشراء",
      },
      { key: "expenses", name: "المصروفات", description: "تسجيل المصروفات" },
    ],
  },
  {
    title: "العملاء والموظفون",
    items: [
      { key: "loyalty", name: "الولاء", description: "نقاط ومكافآت العملاء" },
      {
        key: "employees",
        name: "الموظفون",
        description: "المستخدمون والأدوار",
      },
    ],
  },
  {
    title: "التقارير",
    items: [
      {
        key: "reports",
        name: "التقارير",
        description: "تقارير الأداء الأساسية",
      },
      {
        key: "advancedReports",
        name: "تقارير متقدمة",
        description: "تحليلات وتقارير موسعة",
      },
    ],
  },
];

const all = FEATURE_GROUPS.flatMap((group) =>
  group.items.map((item) => item.key),
);
export const DEFAULT_PLANS: Plan[] = [
  {
    id: "plan-basic",
    code: "BASIC",
    name: "Basic",
    description: "البداية لإدارة المقهى",
    active: true,
    maxBranches: 1,
    features: ["pos", "orders", "tables", "kitchen", "takeaway", "reports"],
  },
  {
    id: "plan-pro",
    code: "PRO",
    name: "Pro",
    description: "أدوات تشغيل ونمو متكاملة",
    active: true,
    maxBranches: 3,
    features: [...all.filter((key) => key !== "advancedReports")],
  },
  {
    id: "plan-premium",
    code: "PREMIUM",
    name: "Premium",
    description: "كل أدوات المنصة",
    active: true,
    maxBranches: 10,
    features: all,
  },
];

export const PLANS_STORAGE_KEY = "penta-k-platform-plans";
export function getPlans() {
  if (typeof window === "undefined") return DEFAULT_PLANS;
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(PLANS_STORAGE_KEY) || "null",
    ) as Partial<Plan>[] | null;
    return Array.isArray(stored)
      ? (stored.map((plan) => ({
          ...plan,
          maxBranches: Math.max(1, Number(plan.maxBranches) || 1),
        })) as Plan[])
      : DEFAULT_PLANS;
  } catch {
    return DEFAULT_PLANS;
  }
}
export function savePlans(plans: Plan[]) {
  if (typeof window !== "undefined")
    window.localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
}
export function normalizePlanCode(code: string) {
  return code === "STARTER"
    ? "BASIC"
    : code === "GROWTH"
      ? "PRO"
      : code === "ENTERPRISE"
        ? "PREMIUM"
        : code;
}
export function getPlanByCode(code: string) {
  const normalized = normalizePlanCode(code);
  const plans = getPlans();
  return (
    plans.find((plan) => plan.code === normalized) ??
    plans.find((plan) => plan.active) ??
    DEFAULT_PLANS.find((plan) => plan.code === normalized) ??
    DEFAULT_PLANS[0]
  );
}
export function getEffectiveFeatures(
  planCode: string,
  overrides?: Partial<Record<FeatureKey, boolean>>,
) {
  const normalized = normalizePlanCode(planCode);
  const plan = getPlanByCode(normalized);
  const result = {
    onlineMenu: false,
    qrOrdering: false,
    delivery: false,
    inventory: false,
    reports: false,
  } as TenantFeatures;
  FEATURE_GROUPS.flatMap((group) => group.items).forEach((item) => {
    result[item.key] =
      overrides?.[item.key] ?? plan.features.includes(item.key);
  });
  return result;
}
