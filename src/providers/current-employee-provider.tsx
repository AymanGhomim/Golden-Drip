"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { hasAllPermissions, hasAnyPermission, hasPermission } from "@/lib/access-control";
import { useTenant } from "@/providers/tenant-provider";
import { employeeService } from "@/services/employee.service";
import { roleService } from "@/services/role.service";
import { useAuthStore } from "@/store/auth.store";
import type { CafeEmployee, CafeRole, PermissionKey } from "@/types/access-control.types";

type CurrentEmployeeValue = {
  employee: CafeEmployee | null;
  role: CafeRole | null;
  permissions: PermissionKey[];
  hasPermission: (permission: PermissionKey) => boolean;
  hasAnyPermission: (permissions: PermissionKey[]) => boolean;
  hasAllPermissions: (permissions: PermissionKey[]) => boolean;
  refresh: () => void;
};

const CurrentEmployeeContext = createContext<CurrentEmployeeValue | null>(null);

export function CurrentEmployeeProvider({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();
  const user = useAuthStore((state) => state.user);
  const [revision, setRevision] = useState(0);
  const refresh = () => setRevision((value) => value + 1);

  useEffect(() => {
    const handleChange = () => refresh();
    window.addEventListener("access-control:changed", handleChange);
    window.addEventListener("tenant:changed", handleChange);
    return () => {
      window.removeEventListener("access-control:changed", handleChange);
      window.removeEventListener("tenant:changed", handleChange);
    };
  }, []);

  const value = useMemo(() => {
    void revision;
    const employees = employeeService.getEmployees(tenant.id);
    const employee = user?.tenantId === tenant.id && user.employeeId
      ? employeeService.getEmployeeById(user.employeeId, tenant.id) ?? null
      : user?.tenantId === tenant.id || user?.role === "platform_super_admin"
        ? employees.find((item) => roleService.getRoleById(item.roleId, tenant.id)?.code === "OWNER") ?? null
        : null;
    const role = employee ? roleService.getRoleById(employee.roleId, tenant.id) ?? null : null;
    const permissions = role?.permissions ?? [];
    return {
      employee,
      role,
      permissions,
      hasPermission: (permission: PermissionKey) => hasPermission(permissions, permission),
      hasAnyPermission: (required: PermissionKey[]) => hasAnyPermission(permissions, required),
      hasAllPermissions: (required: PermissionKey[]) => hasAllPermissions(permissions, required),
      refresh,
    };
  }, [revision, tenant.id, user]);

  return <CurrentEmployeeContext.Provider value={value}>{children}</CurrentEmployeeContext.Provider>;
}

export function useCurrentEmployee() {
  const value = useContext(CurrentEmployeeContext);
  if (!value) throw new Error("useCurrentEmployee must be used within CurrentEmployeeProvider");
  return value;
}
