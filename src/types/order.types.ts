export type OrderStatus =
  | "NEW"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type OrderType = "TABLE" | "TAKEAWAY" | "DELIVERY";

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  notes?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  tableNumber: number;
  orderType: OrderType;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNotes?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  total: number;
  createdAt: string;
};
