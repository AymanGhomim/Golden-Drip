import {
  CUSTOMER_ROUTE_PARAMS,
  customerRouteHref,
  type CustomerOrderType,
} from "@/constants/customer-route";
import { branchService } from "@/services/branch.service";
import { tenantService } from "@/services/tenant.service";
import { getTenantTables } from "@/services/cafe-data.service";
import type { Branch } from "@/types/branch.types";
import type { Table } from "@/types/table.types";
import type { Tenant } from "@/types/tenant.types";
import { hasTenantFeature } from "@/config/feature-access.config";

export type CustomerContextError =
  | "INVALID_LINK"
  | "TENANT_NOT_FOUND"
  | "BRANCH_NOT_FOUND"
  | "TABLE_NOT_FOUND"
  | "BRANCH_INACTIVE"
  | "FEATURE_UNAVAILABLE";

export type ResolvedCustomerContext = {
  tenant: Tenant;
  branch: Branch;
  table?: Table;
  orderType?: CustomerOrderType;
  explicit: boolean;
};

export type CustomerContextResult =
  | { ok: true; context: ResolvedCustomerContext }
  | { ok: false; code: CustomerContextError; message: string; explicit: boolean };

const messages: Record<CustomerContextError, string> = {
  INVALID_LINK: "رابط المنيو غير صالح.",
  TENANT_NOT_FOUND: "رابط المنيو غير صالح.",
  BRANCH_NOT_FOUND: "تعذر تحديد الفرع.",
  TABLE_NOT_FOUND: "هذه الطاولة غير متاحة.",
  BRANCH_INACTIVE: "هذا الفرع غير متاح حاليًا.",
  FEATURE_UNAVAILABLE: "هذه الميزة غير متاحة في باقتك الحالية.",
};

function failure(code: CustomerContextError, explicit: boolean): CustomerContextResult {
  return { ok: false, code, message: messages[code], explicit };
}

export function resolveCustomerContext(searchParams: URLSearchParams): CustomerContextResult {
  const tenantId = searchParams.get(CUSTOMER_ROUTE_PARAMS.tenantId)?.trim();
  const branchId = searchParams.get(CUSTOMER_ROUTE_PARAMS.branchId)?.trim();
  const tableId = searchParams.get(CUSTOMER_ROUTE_PARAMS.tableId)?.trim();
  const requestedOrderType = searchParams
    .get(CUSTOMER_ROUTE_PARAMS.orderType)
    ?.trim()
    .toUpperCase();
  const orderType = requestedOrderType as CustomerOrderType | undefined;
  const explicit = Boolean(tenantId || branchId || tableId || requestedOrderType);

  if (explicit && (!tenantId || !branchId)) return failure("INVALID_LINK", true);
  if (
    requestedOrderType &&
    !["TABLE", "TAKEAWAY", "DELIVERY"].includes(requestedOrderType)
  )
    return failure("INVALID_LINK", true);
  if (orderType === "TABLE" && !tableId) return failure("INVALID_LINK", true);

  const fallbackTenantId = tenantService.getSelectedDevelopmentTenant() ?? tenantService.getActiveTenantId();
  const resolvedTenantId = tenantId || fallbackTenantId;
  const tenant = tenantService.getTenant(resolvedTenantId);
  if (!tenant || tenant.status === "ARCHIVED" || tenant.status === "SUSPENDED")
    return failure("TENANT_NOT_FOUND", explicit);
  if (!hasTenantFeature(tenant, "onlineMenu"))
    return failure("FEATURE_UNAVAILABLE", explicit);

  const branches = branchService.getBranches(tenant.id);
  const fallbackBranchId = branchService.getActiveBranchId(tenant.id);
  const branch = branches.find((candidate) => candidate.id === (branchId || fallbackBranchId));
  if (!branch || branch.tenantId !== tenant.id) return failure("BRANCH_NOT_FOUND", explicit);
  if (branch.status !== "ACTIVE") return failure("BRANCH_INACTIVE", explicit);

  let table: Table | undefined;
  if (tableId) {
    if (!hasTenantFeature(tenant, "qrOrdering"))
      return failure("FEATURE_UNAVAILABLE", explicit);
    table = getTenantTables(tenant.id)
      .find((candidate) => candidate.id === tableId && candidate.branchId === branch.id);
    if (!table || !table.isActive) return failure("TABLE_NOT_FOUND", explicit);
  }

  if (orderType === "DELIVERY" && !hasTenantFeature(tenant, "delivery"))
    return failure("FEATURE_UNAVAILABLE", explicit);

  return {
    ok: true,
    context: {
      tenant,
      branch,
      table,
      orderType: table ? "TABLE" : orderType,
      explicit,
    },
  };
}

export const customerContextService = {
  resolve: resolveCustomerContext,
  href(pathname: string, context: Pick<ResolvedCustomerContext, "tenant" | "branch" | "table" | "orderType">) {
    return customerRouteHref(pathname, {
      tenantId: context.tenant.id,
      branchId: context.branch.id,
      tableId: context.table?.id,
      orderType: context.orderType,
    });
  },
};
