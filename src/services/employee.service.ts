import { accessControlRepository } from "@/repositories/access-control.repository";
import { branchService } from "@/services/branch.service";
import { cafeOperationsService } from "@/services/cafe-operations.service";
import { roleService } from "@/services/role.service";
import { tenantService } from "@/services/tenant.service";
import type { BranchAccessMode, CafeEmployee, EmployeeStatus } from "@/types/access-control.types";

const makeId = () => `employee-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const changed = () => typeof window !== "undefined" && window.dispatchEvent(new Event("access-control:changed"));
const activeTenant = () => tenantService.requireActiveTenantId();

function validateAssignment(tenantId: string, roleId: string, mode: BranchAccessMode, branchIds: string[]) {
  if (!roleService.getRoleById(roleId, tenantId)) throw new Error("الدور المختار لا ينتمي إلى هذا الكافيه.");
  const valid = new Set(branchService.getBranches(tenantId).map((branch) => branch.id));
  if (mode === "SELECTED" && !branchIds.length) throw new Error("اختر فرعًا واحدًا على الأقل.");
  if (branchIds.some((id) => !valid.has(id))) throw new Error("أحد الفروع المختارة لا ينتمي إلى هذا الكافيه.");
}

export const employeeService = {
  getEmployees(tenantId = activeTenant()) { return accessControlRepository.getEmployees(tenantId).filter((employee) => employee.tenantId === tenantId); },
  getEmployeeById(id: string, tenantId = activeTenant()) { return this.getEmployees(tenantId).find((employee) => employee.id === id); },
  createEmployee(value: Omit<CafeEmployee, "id" | "tenantId" | "createdAt" | "updatedAt">, tenantId = activeTenant()) {
    validateAssignment(tenantId, value.roleId, value.branchAccess, value.branchIds);
    const now = new Date().toISOString(); const employee: CafeEmployee = { ...value, branchIds: value.branchAccess === "ALL" ? [] : Array.from(new Set(value.branchIds)), id: makeId(), tenantId, createdAt: now, updatedAt: now };
    accessControlRepository.saveEmployees(tenantId, [...this.getEmployees(tenantId), employee]);
    cafeOperationsService.audit({ module: "employees", action: "EMPLOYEE_CREATED", description: `تم إنشاء الموظف ${employee.name}`, entityType: "employee", entityId: employee.id }); changed(); return employee;
  },
  updateEmployee(id: string, patch: Partial<Omit<CafeEmployee, "id" | "tenantId" | "createdAt">>, tenantId = activeTenant()) {
    const current = this.getEmployeeById(id, tenantId); if (!current) throw new Error("الموظف غير موجود.");
    const next = { ...current, ...patch, tenantId, id, updatedAt: new Date().toISOString() };
    validateAssignment(tenantId, next.roleId, next.branchAccess, next.branchIds);
    if (next.branchAccess === "ALL") next.branchIds = [];
    accessControlRepository.saveEmployees(tenantId, this.getEmployees(tenantId).map((employee) => employee.id === id ? next : employee));
    cafeOperationsService.audit({ module: "employees", action: "EMPLOYEE_UPDATED", description: `تم تحديث الموظف ${next.name}`, entityType: "employee", entityId: id });
    if (patch.roleId && patch.roleId !== current.roleId) cafeOperationsService.audit({ module: "employees", action: "EMPLOYEE_ROLE_CHANGED", description: `تم تغيير دور الموظف ${next.name}`, entityType: "employee", entityId: id });
    if (patch.branchAccess || patch.branchIds) cafeOperationsService.audit({ module: "employees", action: "EMPLOYEE_BRANCH_ACCESS_CHANGED", description: `تم تحديث فروع الموظف ${next.name}`, entityType: "employee", entityId: id }); changed(); return next;
  },
  changeEmployeeRole(id: string, roleId: string, tenantId = activeTenant()) { return this.updateEmployee(id, { roleId }, tenantId); },
  updateEmployeeBranchAccess(id: string, branchAccess: BranchAccessMode, branchIds: string[], tenantId = activeTenant()) { return this.updateEmployee(id, { branchAccess, branchIds }, tenantId); },
  setStatus(id: string, status: EmployeeStatus, tenantId = activeTenant()) {
    const employee = this.updateEmployee(id, { status }, tenantId);
    cafeOperationsService.audit({ module: "employees", action: status === "SUSPENDED" ? "EMPLOYEE_SUSPENDED" : "EMPLOYEE_ACTIVATED", description: `${status === "SUSPENDED" ? "تم إيقاف" : "تم تفعيل"} الموظف ${employee.name}`, entityType: "employee", entityId: id }); changed(); return employee;
  },
  suspendEmployee(id: string, tenantId = activeTenant()) { return this.setStatus(id, "SUSPENDED", tenantId); },
  activateEmployee(id: string, tenantId = activeTenant()) { return this.setStatus(id, "ACTIVE", tenantId); },
  getAccessibleBranches(employee: CafeEmployee, tenantId = activeTenant()) {
    if (employee.tenantId !== tenantId) return [];
    const branches = branchService.getBranches(tenantId);
    return employee.branchAccess === "ALL" ? branches : branches.filter((branch) => employee.branchIds.includes(branch.id));
  },
};
