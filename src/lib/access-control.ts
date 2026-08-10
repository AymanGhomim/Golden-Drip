import type { PermissionKey } from "@/types/access-control.types";
import type { TenantFeatures } from "@/types/tenant.types";

export function hasPermission(permissions: readonly PermissionKey[], permission: PermissionKey) { return permissions.includes(permission); }
export function hasAnyPermission(permissions: readonly PermissionKey[], required: readonly PermissionKey[]) { return required.some((key) => permissions.includes(key)); }
export function hasAllPermissions(permissions: readonly PermissionKey[], required: readonly PermissionKey[]) { return required.every((key) => permissions.includes(key)); }
export function canAccess({ permissions, permission, features, feature }: { permissions: readonly PermissionKey[]; permission: PermissionKey; features?: TenantFeatures; feature?: keyof TenantFeatures }) { return (!feature || Boolean(features?.[feature])) && hasPermission(permissions, permission); }
