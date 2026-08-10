import { accessControlRepository } from "@/repositories/access-control.repository";
import { cafeOperationsService } from "@/services/cafe-operations.service";
import { tenantService } from "@/services/tenant.service";
import type { CafeRole, PermissionKey } from "@/types/access-control.types";

const makeId = () => `role-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const changed = () => typeof window !== "undefined" && window.dispatchEvent(new Event("access-control:changed"));
const activeTenant = () => tenantService.requireActiveTenantId();

export const roleService = {
  getRoles(tenantId = activeTenant()) { return accessControlRepository.getRoles(tenantId).filter((role) => role.tenantId === tenantId); },
  getRoleById(id: string, tenantId = activeTenant()) { return this.getRoles(tenantId).find((role) => role.id === id); },
  getEffectivePermissions(roleId: string, tenantId = activeTenant()): PermissionKey[] { return [...(this.getRoleById(roleId, tenantId)?.permissions ?? [])]; },
  createRole(value: Pick<CafeRole, "name" | "description" | "permissions">, tenantId = activeTenant()) {
    const now = new Date().toISOString();
    const role: CafeRole = { ...value, id: makeId(), tenantId, systemRole: false, permissions: Array.from(new Set(value.permissions)), createdAt: now, updatedAt: now };
    accessControlRepository.saveRoles(tenantId, [...this.getRoles(tenantId), role]);
    cafeOperationsService.audit({ module: "roles", action: "ROLE_CREATED", description: `تم إنشاء الدور ${role.name}`, entityType: "role", entityId: role.id }); changed(); return role;
  },
  updateRole(id: string, patch: Partial<Pick<CafeRole, "name" | "description" | "permissions">>, tenantId = activeTenant()) {
    const current = this.getRoleById(id, tenantId); if (!current) throw new Error("الدور غير موجود.");
    if (current.code === "OWNER" && patch.permissions) throw new Error("لا يمكن تقليل صلاحيات دور المالك.");
    const roles = this.getRoles(tenantId).map((role) => role.id === id ? { ...role, ...patch, permissions: patch.permissions ? Array.from(new Set(patch.permissions)) : role.permissions, updatedAt: new Date().toISOString() } : role);
    accessControlRepository.saveRoles(tenantId, roles); cafeOperationsService.audit({ module: "roles", action: "ROLE_UPDATED", description: `تم تحديث الدور ${current.name}`, entityType: "role", entityId: id }); changed(); return roles.find((role) => role.id === id)!;
  },
  duplicateRole(id: string, name?: string, tenantId = activeTenant()) {
    const source = this.getRoleById(id, tenantId); if (!source) throw new Error("الدور غير موجود.");
    const copy = this.createRole({ name: name?.trim() || `${source.name} - نسخة`, description: source.description, permissions: source.permissions }, tenantId);
    cafeOperationsService.audit({ module: "roles", action: "ROLE_DUPLICATED", description: `تم نسخ الدور ${source.name} إلى ${copy.name}`, entityType: "role", entityId: copy.id }); return copy;
  },
  deleteRole(id: string, tenantId = activeTenant()) {
    const role = this.getRoleById(id, tenantId); if (!role) throw new Error("الدور غير موجود.");
    if (role.systemRole) throw new Error("لا يمكن حذف دور أساسي.");
    if (accessControlRepository.getEmployees(tenantId).some((employee) => employee.roleId === id)) throw new Error("لا يمكن حذف هذا الدور لأنه مرتبط بموظفين.");
    accessControlRepository.saveRoles(tenantId, this.getRoles(tenantId).filter((item) => item.id !== id));
    cafeOperationsService.audit({ module: "roles", action: "ROLE_DELETED", description: `تم حذف الدور ${role.name}`, entityType: "role", entityId: id }); changed();
  },
};
