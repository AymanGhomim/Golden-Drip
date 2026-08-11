import type { CafeLoginRequest } from "@contracts/auth.types";
import type { DesktopSession } from "@/types";
import type { DesktopDevelopmentSnapshot } from "@/types";
import { desktopDevelopmentRepository } from "@/dev/development-repository";

export type DesktopLoginResult =
  | { ok: true; session: DesktopSession; snapshot: DesktopDevelopmentSnapshot }
  | { ok: false; code: "INVALID_CREDENTIALS" | "CLIENT_TYPE_NOT_ALLOWED" };

export async function developmentCafeLogin(request: CafeLoginRequest): Promise<DesktopLoginResult> {
  await Promise.resolve();
  const tenant = desktopDevelopmentRepository.findTenantBySlug(request.tenantCode);
  const password = import.meta.env.VITE_DESKTOP_DEV_PASSWORD || "desktop123";
  const session = desktopDevelopmentRepository.createSession(request.tenantCode, request.login);
  if (!tenant || !session || request.password !== password)
    return { ok: false, code: "INVALID_CREDENTIALS" };
  if (request.clientType !== "DESKTOP" || tenant.adminClientMode === "WEB")
    return { ok: false, code: "CLIENT_TYPE_NOT_ALLOWED" };
  return {
    ok: true,
    session,
    snapshot: desktopDevelopmentRepository.createSnapshot(
      tenant.id,
      session.currentBranch?.id ?? "",
    ),
  };
}
