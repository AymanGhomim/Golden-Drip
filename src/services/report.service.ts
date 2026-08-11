import { roundMoney } from "@/lib/money";
import { cafeOperationsRepository } from "@/repositories/cafe-operations.repository";
import { tenantDataRepository } from "@/repositories/tenant-data.repository";
import { branchService } from "@/services/branch.service";
import { tenantService } from "@/services/tenant.service";
import type {
  Expense,
  InventoryItem,
  PaymentRecord,
  Recipe,
  RefundRecord,
  StockMovement,
  WasteRecord,
} from "@/types/cafe-operations.types";
import type {
  OrderSource,
  OrderType,
  PaymentMethod,
} from "@/types/order.types";
import { calculateRecipeCost } from "@/lib/recipe-cost";
import { useAuthStore } from "@/store/auth.store";
import { employeeService } from "@/services/employee.service";

export type ReportFilters = {
  from?: string;
  to?: string;
  branchIds?: string[];
  orderType?: OrderType;
  orderSource?: OrderSource;
  paymentMethod?: PaymentMethod;
  allowedBranchIds?: string[];
};

const inRange = (date: string, from?: string, to?: string) =>
  (!from || new Date(date) >= new Date(`${from}T00:00:00`)) &&
  (!to || new Date(date) <= new Date(`${to}T23:59:59.999`));

function scope(filters: ReportFilters) {
  const tenantId = tenantService.requireActiveTenantId();
  const tenantBranchIds = branchService.getBranches(tenantId).map((item) => item.id);
  const user = useAuthStore.getState().user;
  const employee = user?.tenantId === tenantId && user.employeeId
    ? employeeService.getEmployeeById(user.employeeId, tenantId)
    : undefined;
  const effectiveAllowed = filters.allowedBranchIds ?? (employee
    ? employeeService.getAccessibleBranches(employee, tenantId).map((branch) => branch.id)
    : user?.role === "platform_super_admin"
      ? tenantBranchIds
      : [branchService.getActiveBranchId(tenantId)].filter(Boolean) as string[]);
  const allowed = new Set(effectiveAllowed.filter((id) => tenantBranchIds.includes(id)));
  const requested = filters.branchIds?.length
    ? filters.branchIds
    : ([branchService.getActiveBranchId(tenantId)].filter(Boolean) as string[]);
  return { tenantId, branchIds: requested.filter((id) => allowed.has(id)) };
}

export const reportService = {
  getOrders(filters: ReportFilters = {}) {
    const { tenantId, branchIds } = scope(filters);
    return tenantDataRepository
      .getOrders(tenantId)
      .map((order) => ({ ...order, tenantId }))
      .filter(
        (order) =>
          order.tenantId === tenantId &&
          Boolean(order.branchId && branchIds.includes(order.branchId)) &&
          inRange(order.createdAt, filters.from, filters.to) &&
          (!filters.orderType || order.orderType === filters.orderType) &&
          (!filters.orderSource || order.source === filters.orderSource) &&
          (!filters.paymentMethod ||
            order.paymentMethod === filters.paymentMethod),
      );
  },
  getBranchRecords<T extends { branchId?: string; createdAt?: string }>(
    resource: Parameters<typeof cafeOperationsRepository.get>[0],
    filters: ReportFilters = {},
  ) {
    const { tenantId, branchIds } = scope(filters);
    return branchIds
      .flatMap((branchId) =>
        cafeOperationsRepository.getForBranch<T & { id: string }>(
          resource,
          branchId,
          tenantId,
        ),
      )
      .filter(
        (item) =>
          !item.createdAt || inRange(item.createdAt, filters.from, filters.to),
      );
  },
  sales(filters: ReportFilters = {}) {
    const orders = this.getOrders(filters).filter(
      (order) => order.status !== "CANCELLED",
    );
    const payments = this.getBranchRecords<PaymentRecord>("payments", filters);
    const refunds = this.getBranchRecords<RefundRecord>("refunds", filters);
    const grossSales = roundMoney(
      orders.reduce((sum, item) => sum + item.total, 0),
    );
    const discounts = roundMoney(
      orders.reduce((sum, item) => sum + Number(item.discount ?? 0), 0),
    );
    const refundTotal = roundMoney(
      refunds.reduce((sum, item) => sum + item.amount, 0),
    );
    const taxes = roundMoney(
      orders.reduce((sum, item) => sum + Number(item.tax ?? 0), 0),
    );
    const serviceCharges = roundMoney(
      orders.reduce((sum, item) => sum + Number(item.serviceCharge ?? 0), 0),
    );
    const deliveryFees = roundMoney(
      orders.reduce((sum, item) => sum + Number(item.deliveryFee ?? 0), 0),
    );
    const netSales = roundMoney(grossSales - refundTotal);
    return {
      orders,
      payments,
      grossSales,
      discounts,
      refunds: refundTotal,
      netSales,
      taxes,
      serviceCharges,
      deliveryFees,
      orderCount: orders.length,
      averageOrder: orders.length ? roundMoney(grossSales / orders.length) : 0,
    };
  },
  profit(filters: ReportFilters = {}) {
    const sales = this.sales(filters);
    const inventoryByBranch = new Map<string, InventoryItem[]>();
    const recipesByBranch = new Map<string, Recipe[]>();
    sales.orders.forEach((order) => {
      if (order.branchId && !inventoryByBranch.has(order.branchId)) {
        inventoryByBranch.set(order.branchId, cafeOperationsRepository.getForBranch<InventoryItem>("inventory", order.branchId, order.tenantId));
        recipesByBranch.set(order.branchId, cafeOperationsRepository.getForBranch<Recipe>("recipes", order.branchId, order.tenantId));
      }
    });
    const cogs = roundMoney(
      sales.orders.reduce(
        (total, order) =>
          total +
          order.items.reduce(
            (sum, item) =>
              sum +
              calculateRecipeCost(
                recipesByBranch.get(order.branchId ?? "")?.find((recipe) => recipe.productId === item.productId) ?? { id: "missing", productId: item.productId, ingredients: [] },
                inventoryByBranch.get(order.branchId ?? "") ?? [],
              ) * item.quantity,
            0,
          ),
        0,
      ),
    );
    const expenses = roundMoney(
      this.getBranchRecords<Expense>("expenses", filters).reduce(
        (sum, item) => sum + item.amount,
        0,
      ),
    );
    const grossProfit = roundMoney(sales.netSales - cogs);
    return {
      revenue: sales.netSales,
      cogs,
      grossProfit,
      expenses,
      netProfit: roundMoney(grossProfit - expenses),
      estimated: true,
    };
  },
  products(filters: ReportFilters = {}) {
    const rows = new Map<
      string,
      { productId: string; name: string; quantity: number; revenue: number }
    >();
    this.getOrders(filters)
      .filter((order) => order.status !== "CANCELLED")
      .forEach((order) =>
        order.items.forEach((item) => {
          const row = rows.get(item.productId) ?? {
            productId: item.productId,
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
          row.quantity += item.quantity;
          row.revenue = roundMoney(row.revenue + item.totalPrice);
          rows.set(item.productId, row);
        }),
      );
    return Array.from(rows.values()).sort((a, b) => b.quantity - a.quantity);
  },
  orderBreakdown(filters: ReportFilters = {}) {
    const orders = this.getOrders(filters);
    const count = <T extends string>(values: T[]) =>
      values.map((value) => ({
        value,
        count: orders.filter(
          (item) => item.orderType === value || item.source === value,
        ).length,
      }));
    return {
      byType: count<OrderType>(["TABLE", "TAKEAWAY", "DELIVERY"]),
      bySource: count<OrderSource>(["POS", "QR_MENU", "ONLINE_MENU", "MANUAL"]),
    };
  },
  payments(filters: ReportFilters = {}) {
    const records = this.getBranchRecords<PaymentRecord>("payments", filters);
    const total = records.reduce((sum, item) => sum + item.amount, 0);
    return (["CASH", "CARD", "WALLET", "ONLINE", "MIXED"] as const).map(
      (method) => {
        const filtered = records.filter((item) => item.method === method);
        const amount = roundMoney(
          filtered.reduce((sum, item) => sum + item.amount, 0),
        );
        return {
          method,
          amount,
          count: filtered.length,
          percentage: total ? roundMoney((amount / total) * 100) : 0,
        };
      },
    );
  },
  inventory(filters: ReportFilters = {}) {
    const items = this.getBranchRecords<InventoryItem>("inventory", filters);
    const movements = this.getBranchRecords<StockMovement>(
      "stockMovements",
      filters,
    );
    const waste = this.getBranchRecords<WasteRecord>("waste", filters);
    return {
      value: roundMoney(
        items.reduce((sum, item) => sum + item.quantity * item.averageCost, 0),
      ),
      lowStock: items.filter(
        (item) => item.quantity > 0 && item.quantity <= item.minimumStock,
      ).length,
      outOfStock: items.filter((item) => item.quantity <= 0).length,
      purchases: movements.filter((item) => item.type === "PURCHASE").length,
      waste: roundMoney(
        waste.reduce((sum, item) => sum + item.estimatedCost, 0),
      ),
      saleConsumption: movements.filter((item) => item.type === "SALE").length,
      adjustments: movements.filter((item) => item.type === "ADJUSTMENT")
        .length,
    };
  },
  toCsv(rows: Record<string, unknown>[]) {
    if (!rows.length) throw new Error("لا توجد بيانات كافية للتصدير.");
    const headers = Object.keys(rows[0]);
    const escape = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;
    return `\uFEFF${headers.map(escape).join(",")}\n${rows.map((row) => headers.map((key) => escape(row[key])).join(",")).join("\n")}`;
  },
};
