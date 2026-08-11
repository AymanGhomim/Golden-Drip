import { tenantStorage } from "@/repositories/tenant-storage";
import type { CustomerOrderType } from "@/constants/customer-route";

export type CashierQrConfig = {
  orderType: CustomerOrderType;
  tableId?: string;
};

const defaultConfig: CashierQrConfig = { orderType: "TAKEAWAY" };

export const cashierQrService = {
  get(tenantId: string, branchId: string): CashierQrConfig {
    const stored = tenantStorage.getForBranch<CashierQrConfig>(
      tenantId,
      branchId,
      "cashier-qr",
      defaultConfig,
    );
    return stored.orderType === "TABLE" && !stored.tableId
      ? defaultConfig
      : stored;
  },
  save(tenantId: string, branchId: string, config: CashierQrConfig) {
    const normalized =
      config.orderType === "TABLE"
        ? config
        : { orderType: config.orderType };
    return tenantStorage.setForBranch(
      tenantId,
      branchId,
      "cashier-qr",
      normalized,
    );
  },
};
