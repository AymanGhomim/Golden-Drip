import { tenantStorage } from "@/repositories/tenant-storage";
import type { CustomerMenuSettings } from "@/types/customer-menu-settings.types";

const defaults = (tenantId: string): CustomerMenuSettings => ({
  tenantId, onlineOrderingEnabled: true, menuOpen: true, autoAcceptOrders: false,
  qrEnabled: true, multipleTableOrders: true, waiterRequestsEnabled: true,
  billRequestsEnabled: true, payAtCashierEnabled: true,
  electronicDineInPaymentEnabled: false, takeawayEnabled: true,
  asapPickupEnabled: true, scheduledPickupEnabled: false, preparationMinutes: 15,
  deliveryEnabled: true, minimumDeliveryOrder: 150, estimatedDeliveryMinutes: 45,
  cashEnabled: true, cardEnabled: false, walletEnabled: false,
  onlinePaymentEnabled: false, updatedAt: new Date(0).toISOString(),
});

export const customerMenuSettingsRepository = {
  get: (tenantId: string) => tenantStorage.get<CustomerMenuSettings>(tenantId, "customer-menu-settings", defaults(tenantId)),
  save: (settings: CustomerMenuSettings) => tenantStorage.set(settings.tenantId, "customer-menu-settings", settings),
};
