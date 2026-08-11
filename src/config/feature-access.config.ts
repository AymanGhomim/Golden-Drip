import { getEffectiveFeatures } from "@/config/plans.config";
import type { FeatureKey } from "@/types/platform.types";
import type { Tenant } from "@/types/tenant.types";

export type FeatureRouteRule = { prefix: string; feature: FeatureKey };

export const FEATURE_ROUTE_RULES: FeatureRouteRule[] = [
  { prefix: "/admin/menu-overview", feature: "onlineMenu" },
  { prefix: "/admin/menu-settings", feature: "onlineMenu" },
  { prefix: "/admin/waiter-requests", feature: "qrOrdering" },
  { prefix: "/admin/delivery-zones", feature: "delivery" },
  { prefix: "/admin/stock-movements", feature: "inventory" },
  { prefix: "/admin/stock-count", feature: "inventory" },
  { prefix: "/admin/inventory", feature: "inventory" },
  { prefix: "/admin/waste", feature: "inventory" },
  { prefix: "/admin/purchases", feature: "purchases" },
  { prefix: "/admin/suppliers", feature: "suppliers" },
  { prefix: "/admin/recipes", feature: "recipes" },
  { prefix: "/admin/expenses", feature: "expenses" },
  { prefix: "/admin/employees", feature: "employees" },
  { prefix: "/admin/roles", feature: "employees" },
  { prefix: "/admin/reports", feature: "reports" },
  { prefix: "/admin/qr", feature: "qrOrdering" },
  { prefix: "/admin/tables", feature: "tables" },
  { prefix: "/admin/orders", feature: "orders" },
  { prefix: "/admin/pos", feature: "pos" },
  { prefix: "/kitchen/orders", feature: "kitchen" },
  { prefix: "/admin/menus", feature: "onlineMenu" },
  { prefix: "/admin/offers", feature: "onlineMenu" },
  { prefix: "/admin/coupons", feature: "onlineMenu" },
];

export function getEffectiveTenantFeatures(tenant: Tenant) {
  return getEffectiveFeatures(tenant.plan, tenant.featureOverrides);
}

export function hasTenantFeature(tenant: Tenant, feature: FeatureKey) {
  return Boolean(getEffectiveTenantFeatures(tenant)[feature]);
}

export function getRequiredFeatureForRoute(pathname: string) {
  return [...FEATURE_ROUTE_RULES]
    .sort((left, right) => right.prefix.length - left.prefix.length)
    .find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    ?.feature;
}
