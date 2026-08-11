import type { Branch } from "../../src/types/branch.types";
import type {
  PaymentMethod,
  PaymentStatus,
  Order,
  OrderSource,
  OrderStatus,
  OrderType,
} from "../../src/types/order.types";
import type { Tenant, TenantBranding } from "../../src/types/tenant.types";

export type ReceiptMoneyRow = {
  key: "subtotal" | "discount" | "coupon" | "tax" | "service" | "delivery";
  label: string;
  amount: number;
};

export type ReceiptItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  note?: string;
  variantName?: string;
  modifiers: { id: string; name: string; amount: number }[];
};

export type ReceiptPaymentData = {
  method?: PaymentMethod;
  status?: PaymentStatus;
  paidAmount?: number;
  cashReceived?: number;
  changeAmount?: number;
  refundedAmount?: number;
};

export type OrderReceiptData = {
  cafe: {
    name: string;
    logo?: string;
    branchName?: string;
    address?: string;
    phone?: string;
    taxNumber?: string;
    headerMessage?: string;
    footerMessage?: string;
  };
  order: {
    number: string;
    createdAt: string;
    cashier?: string;
    type: OrderType;
    source?: OrderSource;
    tableNumber?: number;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    status: OrderStatus;
  };
  items: ReceiptItem[];
  totals: ReceiptMoneyRow[];
  total: number;
  payment: ReceiptPaymentData;
  currency: string;
  locale: string;
  timezone: string;
};

export type BuildOrderReceiptInput = {
  order: Order;
  tenant: Tenant;
  branch?: Branch | null;
  branding: TenantBranding;
  cashierName?: string;
  payment?: ReceiptPaymentData;
};

export function buildOrderReceiptData({
  order,
  tenant,
  branch,
  branding,
  cashierName,
  payment = {},
}: BuildOrderReceiptInput): OrderReceiptData {
  const receiptSettings = branding.receipt;
  const totals: ReceiptMoneyRow[] = [
    { key: "subtotal", label: "الإجمالي الفرعي", amount: order.subtotal },
  ];

  if (order.discount) totals.push({ key: "discount", label: "الخصم", amount: -order.discount });
  if (order.couponDiscount)
    totals.push({ key: "coupon", label: "خصم الكوبون", amount: -order.couponDiscount });
  if (order.tax) totals.push({ key: "tax", label: "الضريبة", amount: order.tax });
  if (order.serviceCharge)
    totals.push({ key: "service", label: "رسوم الخدمة", amount: order.serviceCharge });
  if (order.deliveryFee)
    totals.push({ key: "delivery", label: "رسوم التوصيل", amount: order.deliveryFee });

  return {
    cafe: {
      name: tenant.name,
      logo: branding.logo || undefined,
      branchName: branch?.name,
      address: branch?.address ?? receiptSettings?.address ?? tenant.contact?.address,
      phone: branch?.phone ?? receiptSettings?.phone ?? tenant.contact?.phone,
      taxNumber: receiptSettings?.taxNumber,
      headerMessage: receiptSettings?.header,
      footerMessage: receiptSettings?.footer,
    },
    order: {
      number: order.orderNumber,
      createdAt: order.createdAt,
      cashier: cashierName ?? order.createdBy,
      type: order.orderType,
      source: order.source,
      tableNumber: order.orderType === "TABLE" ? order.tableNumber : undefined,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: order.orderType === "DELIVERY" ? order.customerAddress : undefined,
      status: order.status,
    },
    items: order.items.map((item) => ({
      id: item.id,
      name: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.totalPrice,
      note: item.notes,
      variantName: item.variantName,
      modifiers: [
        ...(item.selectedModifiers?.map((modifier) => ({
          id: `${modifier.groupId}-${modifier.optionId}`,
          name: modifier.optionName,
          amount: modifier.priceAdjustment,
        })) ?? []),
        ...(item.addons?.map((addon) => ({
          id: addon.id,
          name: addon.name,
          amount: addon.price,
        })) ?? []),
      ],
    })),
    totals,
    total: order.total,
    payment: {
      method: payment.method ?? order.paymentMethod,
      status: payment.status ?? order.paymentStatus,
      paidAmount: payment.paidAmount,
      cashReceived: payment.cashReceived,
      changeAmount: payment.changeAmount,
      refundedAmount: payment.refundedAmount,
    },
    currency: tenant.settings.currencySymbol,
    locale: tenant.settings.locale === "ar" ? "ar-EG" : "en-US",
    timezone: tenant.settings.timezone,
  };
}
