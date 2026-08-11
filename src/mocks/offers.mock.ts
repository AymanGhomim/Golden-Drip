import { developmentOffers, forTenant } from "@shared/development-data";
import { getMockTenantId } from "@/mocks/mock-tenant-context";

export const goldenOffers = forTenant(developmentOffers, "tenant-golden-drip");
export const mockOffers = forTenant(developmentOffers, getMockTenantId());
