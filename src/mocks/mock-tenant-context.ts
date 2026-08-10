import { tenantService } from "@/services/tenant.service";

export function getMockTenantId() { return tenantService.getActiveTenantId(); }
