import { developmentCategories, forTenant } from "@shared/development-data";
import { getMockTenantId } from "@/mocks/mock-tenant-context";

export const goldenCategories = forTenant(developmentCategories, "tenant-golden-drip");
export const mockCategories = forTenant(developmentCategories, getMockTenantId());
