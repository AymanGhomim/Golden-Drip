import { mockTenantRepository } from "@/repositories/mock-tenant.repository";
import type { Tenant } from "@/types/tenant.types";

// Frontend-only local demo bootstrap. Normal navigation must use a selected,
// existing tenant; invalid saved IDs are rejected instead of leaking demo data.
const DEVELOPMENT_BOOTSTRAP_TENANT_ID = "tenant-golden-drip";

function requireActiveTenantId() {
  const id =
    mockTenantRepository.getSelected() || DEVELOPMENT_BOOTSTRAP_TENANT_ID;
  if (!mockTenantRepository.get(id))
    throw new Error("تعذر تحديد الكافيه الحالي. اختر كافيهًا صالحًا أولًا.");
  return id;
}

export const tenantService = {
  listTenants: () => mockTenantRepository.list(),
  getTenant: (id: string) => mockTenantRepository.get(id),
  createTenant: (tenant: Tenant) => mockTenantRepository.create(tenant),
  updateTenant: (id: string, patch: Partial<Tenant>) => {
    const tenant = mockTenantRepository.update(id, patch);
    if (
      typeof window !== "undefined" &&
      mockTenantRepository.getSelected() === id
    )
      window.dispatchEvent(new Event("tenant:branding-changed"));
    return tenant;
  },
  selectDevelopmentTenant: (id: string) => mockTenantRepository.setSelected(id),
  getSelectedDevelopmentTenant: () => mockTenantRepository.getSelected(),
  getActiveTenantId: requireActiveTenantId,
  requireActiveTenantId,
};
