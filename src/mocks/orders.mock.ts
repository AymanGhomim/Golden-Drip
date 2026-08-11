import { developmentOrders, forTenant } from "@shared/development-data";
import { getMockTenantId } from "@/mocks/mock-tenant-context";

export const goldenOrders = forTenant(developmentOrders, "tenant-golden-drip");
export const mockOrders = forTenant(developmentOrders, getMockTenantId());
