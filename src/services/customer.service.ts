import { getEffectiveFeatures } from "@/config/plans.config";
import { roundMoney } from "@/lib/money";
import { cafeDataService } from "@/services/cafe-data.service";
import { cafeOperationsService } from "@/services/cafe-operations.service";
import { tenantService } from "@/services/tenant.service";
import type {
  Coupon,
  Customer,
  CustomerAddress,
  LoyaltySettings,
  LoyaltyTransaction,
} from "@/types/cafe-operations.types";
import type { OrderItem } from "@/types/order.types";
import { tenantDataRepository } from "@/repositories/tenant-data.repository";

export type CouponValidationResult =
  | { valid: true; coupon: Coupon; discount: number }
  | { valid: false; code: string; message: string };

const loyaltyDefaults: Omit<LoyaltySettings, "id" | "tenantId"> = {
  enabled: false,
  spendAmountPerPoint: 10,
  pointRedemptionValue: 0.1,
  minimumRedeemPoints: 100,
  updatedAt: new Date(0).toISOString(),
};

export function validateCoupon(input: {
  code: string;
  subtotal: number;
  items: OrderItem[];
  customerId?: string;
  now?: Date;
}): CouponValidationResult {
  const coupon = cafeOperationsService
    .get<Coupon>("coupons")
    .find(
      (item) => item.code.toLowerCase() === input.code.trim().toLowerCase(),
    );
  if (!coupon)
    return { valid: false, code: "NOT_FOUND", message: "كود الخصم غير صحيح." };
  const now = (input.now ?? new Date()).getTime();
  if (!coupon.active)
    return { valid: false, code: "INACTIVE", message: "الكوبون غير نشط." };
  if (coupon.startDate && new Date(coupon.startDate).getTime() > now)
    return {
      valid: false,
      code: "NOT_STARTED",
      message: "الكوبون لم يبدأ بعد.",
    };
  if (coupon.endDate && new Date(coupon.endDate).getTime() < now)
    return {
      valid: false,
      code: "EXPIRED",
      message: "الكوبون منتهي الصلاحية.",
    };
  if (input.subtotal < Number(coupon.minimumOrder ?? 0))
    return {
      valid: false,
      code: "MINIMUM_ORDER",
      message: "الطلب أقل من الحد الأدنى المطلوب للكوبون.",
    };
  if (
    coupon.usageLimit &&
    Number(coupon.usageCount ?? coupon.usages?.length ?? 0) >= coupon.usageLimit
  )
    return {
      valid: false,
      code: "USAGE_LIMIT",
      message: "تم الوصول إلى حد استخدام الكوبون.",
    };
  if (coupon.perCustomerLimit && input.customerId) {
    const count =
      coupon.usages?.filter((item) => item.customerId === input.customerId)
        .length ?? 0;
    if (count >= coupon.perCustomerLimit)
      return {
        valid: false,
        code: "CUSTOMER_LIMIT",
        message: "تم الوصول إلى حد استخدام العميل لهذا الكوبون.",
      };
  }
  const products = new Map(
    cafeDataService.getProducts().map((item) => [item.id, item]),
  );
  const eligible = input.items.filter((item) => {
    const productAllowed =
      !coupon.productIds?.length || coupon.productIds.includes(item.productId);
    const categoryAllowed =
      !coupon.categoryIds?.length ||
      coupon.categoryIds.includes(
        products.get(item.productId)?.categoryId ?? "",
      );
    return productAllowed && categoryAllowed;
  });
  if (!eligible.length)
    return {
      valid: false,
      code: "NOT_APPLICABLE",
      message: "الكوبون لا ينطبق على منتجات الطلب.",
    };
  const eligibleTotal = eligible.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );
  const raw =
    coupon.type === "PERCENTAGE"
      ? eligibleTotal * (coupon.value / 100)
      : coupon.value;
  const discount = roundMoney(
    Math.min(raw, coupon.maximumDiscount ?? raw, input.subtotal),
  );
  return { valid: true, coupon, discount };
}

export const customerService = {
  getCustomers: () => cafeOperationsService.get<Customer>("customers"),
  getCustomer(customerId: string) {
    return this.getCustomers().find((item) => item.id === customerId);
  },
  getCustomerAnalytics(customerId: string) {
    const tenantId = tenantService.requireActiveTenantId();
    const orders = tenantDataRepository
      .getOrders(tenantId)
      .filter(
        (order) =>
          order.tenantId === tenantId &&
          order.customerId === customerId &&
          order.status !== "CANCELLED",
      );
    const totalSpend = roundMoney(
      orders.reduce((sum, order) => sum + order.total, 0),
    );
    const lastOrder = [...orders].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    )[0];
    return {
      orders,
      orderCount: orders.length,
      totalSpend,
      averageOrder: orders.length ? roundMoney(totalSpend / orders.length) : 0,
      lastVisit: lastOrder?.createdAt,
    };
  },
  saveAddress(
    customerId: string,
    value: Omit<CustomerAddress, "id"> & { id?: string },
  ) {
    const customers = this.getCustomers();
    const customer = customers.find((item) => item.id === customerId);
    if (!customer) throw new Error("العميل غير موجود.");
    if (!value.label.trim() || !value.address.trim())
      throw new Error("اسم العنوان وتفاصيله مطلوبان.");
    const address: CustomerAddress = {
      ...value,
      id: value.id ?? `address-${Date.now()}`,
      label: value.label.trim(),
      address: value.address.trim(),
    };
    let addresses = [...(customer.addresses ?? [])];
    addresses = addresses.some((item) => item.id === address.id)
      ? addresses.map((item) => (item.id === address.id ? address : item))
      : [...addresses, address];
    if (address.isDefault || addresses.length === 1)
      addresses = addresses.map((item) => ({
        ...item,
        isDefault: item.id === address.id,
      }));
    cafeOperationsService.save(
      "customers",
      customers.map((item) =>
        item.id === customerId ? { ...item, addresses } : item,
      ),
    );
    cafeOperationsService.audit({
      module: "customers",
      action: "CUSTOMER_ADDRESS_SAVED",
      description: `تم تحديث عنوان العميل ${customer.name}`,
      entityType: "customer",
      entityId: customer.id,
    });
    return address;
  },
  removeAddress(customerId: string, addressId: string) {
    const customers = this.getCustomers();
    const customer = customers.find((item) => item.id === customerId);
    if (!customer) throw new Error("العميل غير موجود.");
    const remaining = (customer.addresses ?? []).filter(
      (item) => item.id !== addressId,
    );
    if (remaining.length && !remaining.some((item) => item.isDefault))
      remaining[0] = { ...remaining[0], isDefault: true };
    cafeOperationsService.save(
      "customers",
      customers.map((item) =>
        item.id === customerId ? { ...item, addresses: remaining } : item,
      ),
    );
    cafeOperationsService.audit({
      module: "customers",
      action: "CUSTOMER_ADDRESS_REMOVED",
      description: `تم حذف عنوان من ملف ${customer.name}`,
      entityType: "customer",
      entityId: customer.id,
    });
  },
  getLoyaltySettings() {
    return (
      cafeOperationsService.get<LoyaltySettings>("loyaltySettings")[0] ??
      loyaltyDefaults
    );
  },
  saveLoyaltySettings(value: {
    enabled: boolean;
    spendAmountPerPoint: number;
    pointRedemptionValue: number;
    minimumRedeemPoints: number;
    maximumRedemptionAmount?: number;
    expiryDays?: number;
  }) {
    if (
      value.spendAmountPerPoint <= 0 ||
      value.pointRedemptionValue <= 0 ||
      value.minimumRedeemPoints < 0
    )
      throw new Error("إعدادات الولاء تحتوي على قيم غير صحيحة.");
    const current =
      cafeOperationsService.get<LoyaltySettings>("loyaltySettings")[0];
    const record: LoyaltySettings = {
      ...value,
      id: current?.id ?? "loyalty-settings",
      tenantId: tenantService.requireActiveTenantId(),
      updatedAt: new Date().toISOString(),
    };
    cafeOperationsService.save("loyaltySettings", [record]);
    cafeOperationsService.audit({
      module: "loyalty",
      action: "LOYALTY_SETTINGS_UPDATED",
      description: "تم تحديث إعدادات برنامج الولاء",
      entityType: "loyaltySettings",
      entityId: record.id,
    });
    return record;
  },
  getLoyaltyBalance(customerId: string) {
    return cafeOperationsService
      .get<LoyaltyTransaction>("loyalty")
      .filter((item) => item.customerId === customerId)
      .reduce(
        (sum, item) =>
          sum +
          (item.type === "EARN" || item.type === "ADJUSTMENT"
            ? item.points
            : -Math.abs(item.points)),
        0,
      );
  },
  addLoyaltyTransaction(value: {
    customerId: string;
    orderId?: string;
    points: number;
    type: LoyaltyTransaction["type"];
    notes?: string;
  }) {
    if (!this.getCustomer(value.customerId))
      throw new Error("العميل غير موجود.");
    if (!Number.isFinite(value.points) || value.points <= 0)
      throw new Error("عدد النقاط يجب أن يكون أكبر من صفر.");
    if (
      (value.type === "REDEEM" || value.type === "EXPIRED") &&
      value.points > this.getLoyaltyBalance(value.customerId)
    )
      throw new Error("رصيد نقاط العميل غير كافٍ.");
    const transaction = cafeOperationsService.create<LoyaltyTransaction>(
      "loyalty",
      { ...value, createdAt: new Date().toISOString() },
    );
    cafeOperationsService.audit({
      module: "loyalty",
      action: `LOYALTY_${value.type}`,
      description: `حركة ولاء ${value.type} بقيمة ${value.points} نقطة`,
      entityType: "loyaltyTransaction",
      entityId: transaction.id,
    });
    return transaction;
  },
  earnForOrder(customerId: string, orderId: string, total: number) {
    const tenant = tenantService.getTenant(
      tenantService.requireActiveTenantId(),
    );
    const settings = this.getLoyaltySettings();
    if (
      !tenant ||
      !settings.enabled ||
      !getEffectiveFeatures(tenant.plan, tenant.featureOverrides).loyalty
    )
      return undefined;
    if (
      cafeOperationsService
        .get<LoyaltyTransaction>("loyalty")
        .some((item) => item.orderId === orderId && item.type === "EARN")
    )
      return undefined;
    const points = Math.floor(total / settings.spendAmountPerPoint);
    return points > 0
      ? this.addLoyaltyTransaction({
          customerId,
          orderId,
          points,
          type: "EARN",
          notes: "نقاط مكتسبة من الطلب",
        })
      : undefined;
  },
};
