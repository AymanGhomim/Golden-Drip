import type { PermissionKey } from "@contracts/access-control.types";
import type { TenantFeatures } from "@contracts/tenant.types";
import type { DesktopSession } from "@/types";

export type AccessRequirement = { permission?: PermissionKey; feature?: keyof TenantFeatures };
export const hasPermission = (session: DesktopSession | null, permission?: PermissionKey) => !permission || Boolean(session?.permissions.includes(permission));
export const hasFeature = (session: DesktopSession | null, feature?: keyof TenantFeatures) => !feature || session?.features[feature] === true;
export const canAccessBranch = (session: DesktopSession | null, branchId: string) => Boolean(session?.accessibleBranches.some((branch) => branch.id === branchId));
export const canAccess = (session: DesktopSession | null, requirement: AccessRequirement) => hasPermission(session, requirement.permission) && hasFeature(session, requirement.feature);
