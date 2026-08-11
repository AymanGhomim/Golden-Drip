import { developmentEmployees, developmentRoles, forTenant } from "@shared/development-data";
import { tenantStorage } from "@/repositories/tenant-storage";
import type { CafeEmployee, CafeRole } from "@/types/access-control.types";

const roleSeeds = (tenantId: string): CafeRole[] => forTenant(developmentRoles, tenantId);
const employeeSeeds = (tenantId: string): CafeEmployee[] => forTenant(developmentEmployees, tenantId);

export const accessControlRepository = {
  getRoles: (tenantId: string) => tenantStorage.get<CafeRole[]>(tenantId, "access-roles", roleSeeds(tenantId)),
  saveRoles: (tenantId: string, roles: CafeRole[]) => tenantStorage.set(tenantId, "access-roles", roles),
  getEmployees: (tenantId: string) => tenantStorage.get<CafeEmployee[]>(tenantId, "access-employees", employeeSeeds(tenantId)),
  saveEmployees: (tenantId: string, employees: CafeEmployee[]) => tenantStorage.set(tenantId, "access-employees", employees),
};
