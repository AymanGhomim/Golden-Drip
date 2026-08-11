import { tenantStorage } from "@/repositories/tenant-storage";
import type { CafeCredential } from "@/types/access-control.types";

const RESOURCE = "access-credentials";

export const credentialRepository = {
  getCredentials: (tenantId: string) =>
    tenantStorage.get<CafeCredential[]>(tenantId, RESOURCE, []),
  saveCredentials: (tenantId: string, credentials: CafeCredential[]) =>
    tenantStorage.set(tenantId, RESOURCE, credentials),
};
