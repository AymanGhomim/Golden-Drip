import { developmentTables, forTenant } from "@shared/development-data";
import { getMockTenantId } from "@/mocks/mock-tenant-context";

export const goldenTables = forTenant(developmentTables, "tenant-golden-drip");
export const mockTables = forTenant(developmentTables, getMockTenantId());
