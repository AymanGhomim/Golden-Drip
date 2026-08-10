export type OperationResource =
  | "inventory"
  | "stockMovements"
  | "stockCounts"
  | "waste"
  | "recipes"
  | "suppliers"
  | "purchases"
  | "expenses"
  | "customers"
  | "loyalty"
  | "coupons"
  | "deliveryZones"
  | "payments"
  | "refunds"
  | "cashRegister"
  | "shifts"
  | "notifications"
  | "auditLog";
export type OperationRecord = {
  id: string;
  tenantId?: string;
  branchId?: string;
  [key: string]: unknown;
};
export type InventoryItem = OperationRecord & {
  name: string;
  sku?: string;
  unit: string;
  quantity: number;
  minimumStock: number;
  averageCost: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
export type StockMovement = OperationRecord & {
  inventoryItemId: string;
  type: "PURCHASE" | "SALE" | "WASTE" | "ADJUSTMENT" | "RETURN";
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  notes?: string;
  createdBy?: string;
  createdAt: string;
};
export type WasteRecord = OperationRecord & {
  inventoryItemId: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  reason: string;
  notes?: string;
  createdAt: string;
};
export type Recipe = OperationRecord & {
  productId: string;
  ingredients: { inventoryItemId: string; quantity: number; unit: string }[];
};
export type Purchase = OperationRecord & {
  invoiceNumber: string;
  supplierId: string;
  date: string;
  items: {
    inventoryItemId: string;
    quantity: number;
    unitCost: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  remaining: number;
  status: "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";
};
export type AuditEntry = OperationRecord & {
  userId?: string;
  module: string;
  action: string;
  description: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
};
export type PaymentRecord = OperationRecord & {
  orderId: string;
  amount: number;
  method: "CASH" | "CARD" | "WALLET" | "ONLINE" | "MIXED";
  allocations?: {
    method: "CASH" | "CARD" | "WALLET" | "ONLINE";
    amount: number;
  }[];
  receivedAmount?: number;
  changeAmount?: number;
  status: "PAID" | "PENDING" | "FAILED" | "REFUNDED";
  createdAt: string;
};
export type Customer = OperationRecord & {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  active: boolean;
  createdAt: string;
};
export type Supplier = OperationRecord & {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
};
export type Expense = OperationRecord & {
  category: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
};
export type DeliveryZone = OperationRecord & {
  name: string;
  fee: number;
  minimumOrder?: number;
  estimatedMinutes?: number;
  active: boolean;
};
export type Coupon = OperationRecord & {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minimumOrder?: number;
  maximumDiscount?: number;
  startDate?: string;
  endDate?: string;
  productIds?: string[];
  categoryIds?: string[];
  active: boolean;
};
export type StockCount = OperationRecord & {
  number: string;
  items: {
    inventoryItemId: string;
    expectedQuantity: number;
    actualQuantity: number;
  }[];
  status: "DRAFT" | "CONFIRMED";
  createdAt: string;
  confirmedAt?: string;
};
