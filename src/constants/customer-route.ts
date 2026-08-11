export const CUSTOMER_ROUTE_PARAMS = {
  tenantId: "tenantId",
  branchId: "branchId",
  tableId: "tableId",
  orderType: "orderType",
} as const;

export type CustomerOrderType = "TABLE" | "TAKEAWAY" | "DELIVERY";

export type CustomerRouteParam =
  (typeof CUSTOMER_ROUTE_PARAMS)[keyof typeof CUSTOMER_ROUTE_PARAMS];

export const CUSTOMER_ROUTE_PREFIXES = [
  "/menu",
  "/cart",
  "/offers/",
  "/order/",
] as const;

export function isCustomerRoute(pathname: string) {
  return CUSTOMER_ROUTE_PREFIXES.some((prefix) =>
    prefix.endsWith("/") ? pathname.startsWith(prefix) : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function customerRouteQuery(value: {
  tenantId: string;
  branchId: string;
  tableId?: string;
  orderType?: CustomerOrderType;
}) {
  const params = new URLSearchParams({
    [CUSTOMER_ROUTE_PARAMS.tenantId]: value.tenantId,
    [CUSTOMER_ROUTE_PARAMS.branchId]: value.branchId,
  });
  if (value.tableId) params.set(CUSTOMER_ROUTE_PARAMS.tableId, value.tableId);
  if (value.orderType)
    params.set(CUSTOMER_ROUTE_PARAMS.orderType, value.orderType);
  return params.toString();
}

export function customerRouteHref(
  pathname: string,
  value: { tenantId: string; branchId: string; tableId?: string; orderType?: CustomerOrderType },
) {
  return `${pathname}?${customerRouteQuery(value)}`;
}
