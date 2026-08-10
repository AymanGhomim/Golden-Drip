import type { Tenant } from "@/types/tenant.types";

export type TenantOwned = { tenantId?: string };

/**
 * Frontend demo helper only. Production isolation must be enforced by the API
 * from the authenticated session; a browser-provided tenantId is not trusted.
 */
export function scopeToTenant<T extends TenantOwned>(items: T[], tenant: Tenant) {
  return items.filter((item) => !item.tenantId || item.tenantId === tenant.id);
}

export function tenantPayload<T extends Record<string, unknown>>(payload: T, tenant: Tenant) {
  return { ...payload, tenantId: tenant.id };
}
