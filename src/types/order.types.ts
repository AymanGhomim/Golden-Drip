export type OrderStatus =
  | "NEW"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type OrderType = "TABLE" | "TAKEAWAY" | "DELIVERY";
export type OrderSource = "POS" | "QR_MENU" | "ONLINE_MENU" | "MANUAL";
export type PaymentStatus =
  "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
export type PaymentMethod = "CASH" | "CARD" | "WALLET" | "ONLINE" | "MIXED";

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  notes?: string;
  variantName?: string;
  addons?: { id: string; name: string; price: number }[];
};

export type Order = {
  id: string;
  tenantId?: string;
  branchId?: string;
  orderNumber: string;
  tableNumber: number;
  orderType: OrderType;
  source?: OrderSource;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  createdBy?: string;
  tableSessionId?: string;
  tableId?: string;
  customerId?: string;
  deliveryZoneId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNotes?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  tax?: number;
  serviceCharge?: number;
  deliveryFee?: number;
  total: number;
  createdAt: string;
  updatedAt?: string;
};
