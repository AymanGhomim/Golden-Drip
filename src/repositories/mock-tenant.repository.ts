import {
  DEMO_TENANTS,
  GOLDEN_DRIP_CONTACT,
} from "@/config/tenants.config";
import type { Tenant } from "@/types/tenant.types";

const STORAGE_KEY = "platform:tenants:v1";
const SELECTED_KEY = "platform:selected-tenant:v1";
const GOLDEN_CONTACT_MIGRATION_KEY = "migration:golden-contact:kafr-v1";
let memoryTenants = [...DEMO_TENANTS];

function read() {
  if (typeof window === "undefined") return memoryTenants;
  try {
    const value = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) || "null",
    );
    if (Array.isArray(value)) {
      const restoreGoldenContact =
        window.localStorage.getItem(GOLDEN_CONTACT_MIGRATION_KEY) !== "done";
      memoryTenants = value.map((tenant: Tenant) =>
        tenant.id === "tenant-golden-drip"
          ? {
              ...tenant,
              maxBranchesOverride: 1,
              contact: restoreGoldenContact
                ? GOLDEN_DRIP_CONTACT
                : tenant.contact,
            }
          : tenant,
      );
      if (restoreGoldenContact) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryTenants));
        window.localStorage.setItem(GOLDEN_CONTACT_MIGRATION_KEY, "done");
      }
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return memoryTenants;
}
function write(tenants: Tenant[]) {
  memoryTenants = tenants;
  if (typeof window !== "undefined")
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
}

export const mockTenantRepository = {
  list: () => [...read()],
  get: (id: string) => read().find((tenant) => tenant.id === id),
  create: (tenant: Tenant) => {
    write([...read(), tenant]);
    return tenant;
  },
  update: (id: string, patch: Partial<Tenant>) => {
    const updated = read().map((tenant) =>
      tenant.id === id ? { ...tenant, ...patch } : tenant,
    );
    write(updated);
    return updated.find((tenant) => tenant.id === id);
  },
  setSelected: (id: string) => {
    if (!read().some((tenant) => tenant.id === id))
      throw new Error("لا يمكن اختيار كافيه غير موجود.");
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SELECTED_KEY, id);
      window.dispatchEvent(new Event("tenant:changed"));
    }
  },
  getSelected: () =>
    typeof window === "undefined"
      ? undefined
      : window.localStorage.getItem(SELECTED_KEY) || undefined,
};
