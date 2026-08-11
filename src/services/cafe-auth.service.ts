import { isAdminClientAllowed } from "@/lib/admin-client-mode";
import { credentialService } from "@/services/credential.service";
import { tenantService } from "@/services/tenant.service";
import type { CafeLoginErrorCode, CafeLoginRequest } from "@/types/auth.types";
import type { CafeEmployee } from "@/types/access-control.types";
import type { Tenant } from "@/types/tenant.types";

export type CafeLoginResult =
  | { ok: true; employee: CafeEmployee; tenant: Tenant }
  | { ok: false; code: CafeLoginErrorCode };

/** Development adapter mirroring POST /api/v1/auth/cafe/login. */
export const cafeAuthService = {
  async login(request: CafeLoginRequest): Promise<CafeLoginResult> {
    const tenant = tenantService
      .listTenants()
      .find((item) => item.slug === request.tenantCode);
    if (!tenant) return { ok: false, code: "TENANT_NOT_FOUND" };
    if (!isAdminClientAllowed(tenant.adminClientMode, request.clientType))
      return { ok: false, code: "CLIENT_TYPE_NOT_ALLOWED" };

    const employee = await credentialService.authenticate(
      tenant.id,
      request.login,
      request.password,
    );
    if (!employee) return { ok: false, code: "INVALID_CREDENTIALS" };
    if (employee.status === "SUSPENDED")
      return { ok: false, code: "EMPLOYEE_SUSPENDED" };
    return { ok: true, employee, tenant };
  },
};
