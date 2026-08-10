"use client";

import { useCurrentEmployee } from "@/providers/current-employee-provider";
import type { PermissionKey } from "@/types/access-control.types";

export function PermissionGate({ permission, anyOf, fallback = null, children }: { permission?: PermissionKey; anyOf?: PermissionKey[]; fallback?: React.ReactNode; children: React.ReactNode }) {
  const access = useCurrentEmployee();
  const allowed = permission ? access.hasPermission(permission) : anyOf ? access.hasAnyPermission(anyOf) : true;
  return allowed ? <>{children}</> : <>{fallback}</>;
}
