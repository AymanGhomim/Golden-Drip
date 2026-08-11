import { developmentProducts, forTenant } from "@shared/development-data";
import { getMockTenantId } from "@/mocks/mock-tenant-context";

export const goldenProducts = forTenant(developmentProducts, "tenant-golden-drip");
export const mockProducts = forTenant(developmentProducts, getMockTenantId());
