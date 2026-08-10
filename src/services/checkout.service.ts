import { branchService } from "@/services/branch.service";
import { cafeDataService } from "@/services/cafe-data.service";
import { cafeOperationsService } from "@/services/cafe-operations.service";
import { tenantService } from "@/services/tenant.service";
import { percentageOf, roundMoney } from "@/lib/money";
import type { CartItem } from "@/types/cart.types";
import type {
  Coupon,
  Customer,
  DeliveryZone,
  InventoryItem,
  PaymentRecord,
  Recipe,
  StockMovement,
} from "@/types/cafe-operations.types";
import type {
  Order,
  OrderItem,
  OrderType,
  PaymentMethod,
} from "@/types/order.types";
import { getEffectiveFeatures } from "@/config/plans.config";
import { convertInventoryQuantity } from "@/lib/inventory-units";

export type CheckoutInput = {
  items: CartItem[];
  orderType: OrderType;
  tableId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  deliveryZoneId?: string;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentAllocations?: PaymentRecord["allocations"];
  receivedAmount?: number;
};
export type CheckoutTotals = {
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  deliveryFee: number;
  total: number;
};

function activeContext() {
  const tenantId = tenantService.requireActiveTenantId();
  const branchId = branchService.getActiveBranchId(tenantId);
  if (!branchId) throw new Error("أضف فرعًا أولًا لبدء إنشاء الطلبات.");
  const branch = branchService.getBranch(branchId, tenantId);
  if (!branch || branch.status !== "ACTIVE")
    throw new Error("الفرع الحالي غير صالح أو غير نشط.");
  if (!branch.menuId) throw new Error("يجب تعيين منيو للفرع قبل إنشاء الطلب.");
  return { tenantId, branchId, branch };
}

function inventoryConsumptionEnabled(tenantId?: string) {
  if (!tenantId) return false;
  const tenant = tenantService.getTenant(tenantId);
  if (!tenant) return false;
  return Boolean(
    tenant.features.inventory &&
    getEffectiveFeatures(tenant.plan, tenant.featureOverrides).inventory,
  );
}

function getInventoryRequirements(
  order: Order,
  recipes: Recipe[],
  inventory: InventoryItem[],
) {
  const requirements = new Map<string, number>();
  order.items.forEach((orderItem) => {
    const recipe = recipes.find(
      (entry) => entry.productId === orderItem.productId,
    );
    recipe?.ingredients.forEach((ingredient) => {
      const inventoryItem = inventory.find(
        (entry) => entry.id === ingredient.inventoryItemId,
      );
      if (!inventoryItem)
        throw new Error("أحد مكونات الوصفة غير موجود في مخزون الفرع.");
      const normalized = convertInventoryQuantity(
        ingredient.quantity,
        ingredient.unit,
        inventoryItem.unit,
      );
      requirements.set(
        ingredient.inventoryItemId,
        (requirements.get(ingredient.inventoryItemId) ?? 0) +
          normalized * orderItem.quantity,
      );
    });
  });
  return requirements;
}

function couponDiscount(
  coupon: Coupon | undefined,
  subtotal: number,
  items: OrderItem[],
) {
  if (!coupon) return 0;
  const now = Date.now();
  if (
    !coupon.active ||
    (coupon.startDate && new Date(coupon.startDate).getTime() > now) ||
    (coupon.endDate && new Date(coupon.endDate).getTime() < now)
  )
    throw new Error("الكوبون غير صالح أو منتهي.");
  if (subtotal < Number(coupon.minimumOrder ?? 0))
    throw new Error("الطلب أقل من الحد الأدنى المطلوب للكوبون.");
  const eligible = items.filter(
    (item) =>
      !coupon.productIds?.length || coupon.productIds.includes(item.productId),
  );
  if (!eligible.length) throw new Error("الكوبون لا ينطبق على منتجات الطلب.");
  const eligibleTotal = eligible.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );
  const raw =
    coupon.type === "PERCENTAGE"
      ? percentageOf(eligibleTotal, coupon.value)
      : coupon.value;
  return roundMoney(Math.min(raw, coupon.maximumDiscount ?? raw, subtotal));
}

export const checkoutService = {
  calculate(
    items: CartItem[],
    couponCode?: string,
    deliveryZoneId?: string,
  ): { items: OrderItem[]; totals: CheckoutTotals; coupon?: Coupon } {
    const { tenantId } = activeContext();
    if (!items.length) throw new Error("السلة فارغة.");
    const catalog = new Map(
      branchService
        .getBranchProducts(undefined, tenantId)
        .map((product) => [product.id, product]),
    );
    const orderItems = items.map((cart, index) => {
      const product = catalog.get(cart.productId);
      if (!product?.isAvailable)
        throw new Error(`المنتج ${cart.name} غير متاح في منيو الفرع.`);
      const addons = cart.addons ?? [];
      const unitPrice = roundMoney(
        product.price +
          Number(cart.variantPrice ?? 0) +
          addons.reduce((sum, addon) => sum + addon.price, 0),
      );
      return {
        id: `order-item-${Date.now()}-${index}`,
        productId: product.id,
        productName: product.name,
        unitPrice,
        quantity: cart.quantity,
        totalPrice: roundMoney(unitPrice * cart.quantity),
        notes: cart.notes,
        variantName: cart.variantName,
        addons,
      };
    });
    const subtotal = roundMoney(
      orderItems.reduce((sum, item) => sum + item.totalPrice, 0),
    );
    const coupon = couponCode
      ? cafeOperationsService
          .get<Coupon>("coupons")
          .find(
            (item) =>
              item.code.toLowerCase() === couponCode.trim().toLowerCase(),
          )
      : undefined;
    if (couponCode && !coupon) throw new Error("كود الخصم غير صحيح.");
    const discount = couponDiscount(coupon, subtotal, orderItems);
    const settings = cafeDataService.getSettings();
    const tax = percentageOf(subtotal - discount, settings.taxRate);
    const serviceCharge = percentageOf(
      subtotal - discount,
      settings.serviceCharge,
    );
    const zone = deliveryZoneId
      ? cafeOperationsService
          .get<DeliveryZone>("deliveryZones")
          .find((item) => item.id === deliveryZoneId && item.active)
      : undefined;
    if (deliveryZoneId && !zone) throw new Error("منطقة التوصيل غير صالحة.");
    const deliveryFee = roundMoney(Number(zone?.fee ?? 0));
    const total = roundMoney(
      subtotal - discount + tax + serviceCharge + deliveryFee,
    );
    return {
      items: orderItems,
      totals: { subtotal, discount, tax, serviceCharge, deliveryFee, total },
      coupon,
    };
  },
  createQuickCustomer(value: {
    name: string;
    phone?: string;
    address?: string;
  }) {
    if (!value.name.trim()) throw new Error("اسم العميل مطلوب.");
    return cafeOperationsService.create<Customer>("customers", {
      ...value,
      active: true,
      createdAt: new Date().toISOString(),
    });
  },
  checkout(input: CheckoutInput) {
    const { tenantId, branchId } = activeContext();
    if (input.orderType === "TABLE" && !input.tableId)
      throw new Error("اختر طاولة للطلب داخل الكافيه.");
    const table = input.tableId
      ? cafeDataService
          .getTables()
          .find((item) => item.id === input.tableId && item.isActive)
      : undefined;
    if (input.tableId && !table)
      throw new Error("الطاولة غير صالحة لهذا الفرع.");
    if (
      input.orderType === "DELIVERY" &&
      (!input.customerName?.trim() ||
        !input.customerPhone?.trim() ||
        !input.customerAddress?.trim() ||
        !input.deliveryZoneId)
    )
      throw new Error("بيانات العميل والعنوان ومنطقة التوصيل مطلوبة.");
    const { items, totals } = this.calculate(
      input.items,
      input.couponCode,
      input.orderType === "DELIVERY" ? input.deliveryZoneId : undefined,
    );
    const timestamp = new Date().toISOString();
    if (
      input.paymentMethod === "CASH" &&
      Number(input.receivedAmount) < totals.total
    )
      throw new Error("المبلغ المستلم أقل من إجمالي الطلب.");
    if (
      input.paymentMethod === "MIXED" &&
      roundMoney(
        (input.paymentAllocations ?? []).reduce(
          (sum, part) => sum + part.amount,
          0,
        ),
      ) !== totals.total
    )
      throw new Error("مبالغ الدفع المختلط لا تساوي إجمالي الطلب.");
    const order: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tenantId,
      branchId,
      orderNumber: `ORD-${String(Date.now()).slice(-6)}`,
      tableId: table?.id,
      tableNumber: table?.number ?? 0,
      orderType: input.orderType,
      source: "POS",
      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerAddress: input.customerAddress,
      deliveryZoneId: input.deliveryZoneId,
      status: "NEW",
      paymentStatus: "PAID",
      paymentMethod: input.paymentMethod,
      items,
      ...totals,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.validateInventory(order);
    cafeDataService.saveOrders([order, ...cafeDataService.getOrders()]);
    const payment = cafeOperationsService.create<PaymentRecord>("payments", {
      orderId: order.id,
      amount: order.total,
      method: input.paymentMethod,
      allocations: input.paymentAllocations,
      receivedAmount: input.receivedAmount,
      changeAmount:
        input.paymentMethod === "CASH"
          ? roundMoney(Number(input.receivedAmount) - order.total)
          : 0,
      status: "PAID",
      createdAt: timestamp,
    });
    this.consumeInventory(order);
    const cashAmount =
      input.paymentMethod === "CASH"
        ? order.total
        : input.paymentMethod === "MIXED"
          ? (input.paymentAllocations?.find((part) => part.method === "CASH")
              ?.amount ?? 0)
          : 0;
    if (cashAmount > 0)
      cafeOperationsService.create("cashRegister", {
        orderId: order.id,
        type: "SALE",
        amount: cashAmount,
        createdAt: timestamp,
      });
    cafeOperationsService.audit({
      branchId,
      module: "pos",
      action: "ORDER_CHECKOUT",
      description: `تم إنشاء الطلب ${order.orderNumber} وتسجيل الدفع`,
      entityType: "order",
      entityId: order.id,
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("orders:changed"));
      window.dispatchEvent(new Event("operations:changed"));
    }
    return { order, payment };
  },
  validateInventory(order: Order) {
    if (!inventoryConsumptionEnabled(order.tenantId)) return;
    const recipes = cafeOperationsService.get<Recipe>("recipes");
    const inventory = cafeOperationsService.get<InventoryItem>("inventory");
    const requirements = getInventoryRequirements(order, recipes, inventory);
    requirements.forEach((quantity, inventoryItemId) => {
      const item = inventory.find((entry) => entry.id === inventoryItemId);
      if (!item) throw new Error("أحد مكونات الوصفة غير موجود في مخزون الفرع.");
      if (quantity > item.quantity)
        throw new Error(`المخزون غير كافٍ للمكون ${item.name}.`);
    });
  },
  consumeInventory(order: Order) {
    if (!inventoryConsumptionEnabled(order.tenantId)) return;
    const recipes = cafeOperationsService.get<Recipe>("recipes");
    const inventory = cafeOperationsService.get<InventoryItem>("inventory");
    if (!recipes.length || !inventory.length) return;
    const requirements = getInventoryRequirements(order, recipes, inventory);
    this.validateInventory(order);
    const updated = inventory.map((item) => {
      const quantity = requirements.get(item.id);
      if (!quantity) return item;
      const after = roundMoney(item.quantity - quantity);
      const movement: Omit<StockMovement, "id" | "tenantId"> = {
        inventoryItemId: item.id,
        type: "SALE",
        quantity,
        quantityBefore: item.quantity,
        quantityAfter: after,
        notes: order.orderNumber,
        createdAt: new Date().toISOString(),
      };
      cafeOperationsService.create<StockMovement>("stockMovements", movement);
      return { ...item, quantity: after, updatedAt: new Date().toISOString() };
    });
    cafeOperationsService.save("inventory", updated);
  },
};
