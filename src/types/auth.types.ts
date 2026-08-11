import type { ClientType } from "./tenant.types";

export type CafeLoginRequest = {
  tenantCode: string;
  login: string;
  password: string;
  clientType: ClientType;
};

export type CafeLoginErrorCode =
  | "TENANT_NOT_FOUND"
  | "CLIENT_TYPE_NOT_ALLOWED"
  | "INVALID_CREDENTIALS"
  | "EMPLOYEE_SUSPENDED";
