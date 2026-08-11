import { cloneDevelopmentFixture, developmentTenants } from "@shared/development-data";
import type { Tenant } from "@/types/tenant.types";

export const DEMO_TENANTS: Tenant[] = cloneDevelopmentFixture(developmentTenants);
export const DEFAULT_TENANT = DEMO_TENANTS[0];
export const GOLDEN_DRIP_CONTACT: NonNullable<Tenant["contact"]> =
  cloneDevelopmentFixture(DEFAULT_TENANT.contact ?? {});
