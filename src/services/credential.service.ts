import { accessControlRepository } from "@/repositories/access-control.repository";
import { credentialRepository } from "@/repositories/credential.repository";
import type { CafeCredential, CafeEmployee } from "@/types/access-control.types";

const normalizeLogin = (value: string) => value.trim().toLowerCase();

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return `sha256:${Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("")}`;
  }

  let hash = 2166136261;
  for (let index = 0; index < bytes.length; index += 1) {
    hash ^= bytes[index];
    hash = Math.imul(hash, 16777619);
  }
  return `fallback:${(hash >>> 0).toString(16)}`;
}

function ownerForTenant(tenantId: string) {
  const roles = accessControlRepository.getRoles(tenantId);
  const ownerRole = roles.find((role) => role.code === "OWNER");
  if (!ownerRole) return undefined;
  return accessControlRepository
    .getEmployees(tenantId)
    .find((employee) => employee.roleId === ownerRole.id);
}

function employeeLogins(employee: CafeEmployee) {
  return [employee.username, employee.email]
    .filter((value): value is string => Boolean(value?.trim()))
    .map(normalizeLogin);
}

async function saveCredential(
  tenantId: string,
  employeeId: string,
  login: string,
  password: string,
) {
  const normalized = normalizeLogin(login);
  const credentials = credentialRepository.getCredentials(tenantId);
  const duplicate = credentials.find(
    (item) => item.employeeId !== employeeId && normalizeLogin(item.login) === normalized,
  );
  if (duplicate) throw new Error("اسم المستخدم مستخدم بالفعل داخل هذا الكافيه.");

  const credential: CafeCredential = {
    tenantId,
    employeeId,
    login: normalized,
    passwordHash: await hashPassword(password),
    updatedAt: new Date().toISOString(),
  };
  credentialRepository.saveCredentials(tenantId, [
    ...credentials.filter((item) => item.employeeId !== employeeId),
    credential,
  ]);
  return credential;
}

export const credentialService = {
  getOwner(tenantId: string) {
    return ownerForTenant(tenantId);
  },

  getLogin(employee: CafeEmployee) {
    return (
      credentialRepository
        .getCredentials(employee.tenantId)
        .find((item) => item.employeeId === employee.id)?.login ??
      employee.username ??
      employee.email ??
      ""
    );
  },

  async authenticate(tenantId: string, login: string, password: string) {
    const normalized = normalizeLogin(login);
    const employees = accessControlRepository.getEmployees(tenantId);
    const credentials = credentialRepository.getCredentials(tenantId);
    const credential = credentials.find((item) => normalizeLogin(item.login) === normalized);
    let employee = credential
      ? employees.find((item) => item.id === credential.employeeId)
      : employees.find((item) => employeeLogins(item).includes(normalized));

    if (!employee) return undefined;

    if (!credential) return undefined;
    const expectedHash = credential.passwordHash;
    if ((await hashPassword(password)) !== expectedHash) return undefined;
    return employee;
  },

  async provisionOwner(
    tenantId: string,
    value: { name: string; email: string; phone: string; username: string; password?: string },
  ) {
    const roles = accessControlRepository.getRoles(tenantId);
    const ownerRole = roles.find((role) => role.code === "OWNER");
    if (!ownerRole) throw new Error("تعذر إنشاء دور مالك الكافيه.");

    const now = new Date().toISOString();
    const employees = accessControlRepository.getEmployees(tenantId);
    const current = employees.find((employee) => employee.roleId === ownerRole.id);
    const owner: CafeEmployee = current
      ? {
          ...current,
          name: value.name.trim() || current.name,
          email: value.email.trim() || undefined,
          phone: value.phone.trim(),
          username: normalizeLogin(value.username),
          status: "ACTIVE",
          updatedAt: now,
        }
      : {
          id: `${tenantId}:employee:owner`,
          tenantId,
          name: value.name.trim() || "مدير الكافيه",
          email: value.email.trim() || undefined,
          phone: value.phone.trim(),
          username: normalizeLogin(value.username),
          roleId: ownerRole.id,
          branchAccess: "ALL",
          branchIds: [],
          status: "ACTIVE",
          joinDate: now.slice(0, 10),
          createdAt: now,
          updatedAt: now,
        };
    accessControlRepository.saveEmployees(tenantId, [
      ...employees.filter((employee) => employee.id !== owner.id),
      owner,
    ]);

    const existingCredential = credentialRepository
      .getCredentials(tenantId)
      .find((item) => item.employeeId === owner.id);
    if (value.password) {
      await saveCredential(tenantId, owner.id, value.username, value.password);
    } else if (existingCredential && existingCredential.login !== normalizeLogin(value.username)) {
      credentialRepository.saveCredentials(tenantId, [
        ...credentialRepository
          .getCredentials(tenantId)
          .filter((item) => item.employeeId !== owner.id),
        { ...existingCredential, login: normalizeLogin(value.username), updatedAt: now },
      ]);
    }
    return owner;
  },

  async changePassword(
    employee: CafeEmployee,
    currentPassword: string,
    newPassword: string,
  ) {
    const login = this.getLogin(employee);
    const authenticated = await this.authenticate(employee.tenantId, login, currentPassword);
    if (!authenticated || authenticated.id !== employee.id) {
      throw new Error("كلمة المرور الحالية غير صحيحة.");
    }
    await saveCredential(employee.tenantId, employee.id, login, newPassword);
  },
};
