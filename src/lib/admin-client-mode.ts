import type { AdminClientMode, ClientType } from "@/types/tenant.types";

export const ADMIN_CLIENT_MODE_LABELS: Record<AdminClientMode, string> = {
  WEB: "الويب فقط",
  DESKTOP: "سطح المكتب فقط",
  BOTH: "الويب وسطح المكتب",
};

export function isAdminClientAllowed(
  mode: AdminClientMode,
  clientType: ClientType,
) {
  return mode === "BOTH" || mode === clientType;
}
