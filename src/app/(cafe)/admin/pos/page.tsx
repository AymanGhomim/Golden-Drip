"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { BranchRequired } from "@/components/admin/branch-required";
import {
  PaymentDialog,
  type PaymentConfirmation,
} from "@/components/admin/payment-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/money";
import { useBranch } from "@/providers/branch-provider";
import { useTenant } from "@/providers/tenant-provider";
import { cafeDataService } from "@/services/cafe-data.service";
import { cafeOperationsService } from "@/services/cafe-operations.service";
import { checkoutService } from "@/services/checkout.service";
import { useCartStore } from "@/store/cart.store";
import { useOrdersStore } from "@/store/orders.store";
import type { Customer, DeliveryZone } from "@/types/cafe-operations.types";
import type { OrderType } from "@/types/order.types";
import type { Product } from "@/types/product.types";

export default function PosPage() {
  const { tenant } = useTenant();
  const { branch } = useBranch();
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("TABLE");
  const [tableId, setTableId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryZoneId, setDeliveryZoneId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const remove = useCartStore((state) => state.removeItem);
  const increase = useCartStore((state) => state.increaseQuantity);
  const decrease = useCartStore((state) => state.decreaseQuantity);
  const updateNotes = useCartStore((state) => state.updateNotes);
  const clearCart = useCartStore((state) => state.clearCart);
  const tables = cafeDataService.getTables();
  const customers = cafeOperationsService.get<Customer>("customers");
  const zones = cafeOperationsService
    .get<DeliveryZone>("deliveryZones")
    .filter((zone) => zone.active);
  const resetDraft = () => {
    setTableId("");
    setCustomerId("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setDeliveryZoneId("");
    setCouponCode("");
    setPaymentOpen(false);
  };
  useEffect(() => {
    const reload = () => setProducts(cafeDataService.getBranchProducts());
    const reset = () => {
      reload();
      clearCart();
      resetDraft();
    };
    reload();
    window.addEventListener("tenant:changed", reset);
    window.addEventListener("branch:changed", reset);
    return () => {
      window.removeEventListener("tenant:changed", reset);
      window.removeEventListener("branch:changed", reset);
    };
  }, [clearCart]);
  const visible = useMemo(
    () =>
      products.filter(
        (product) =>
          product.isAvailable &&
          (!query || product.name.toLowerCase().includes(query.toLowerCase())),
      ),
    [products, query],
  );
  const calculation = useMemo(() => {
    try {
      return {
        result: checkoutService.calculate(
          items,
          couponCode || undefined,
          orderType === "DELIVERY" ? deliveryZoneId || undefined : undefined,
        ),
        error: "",
      };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : "تعذر حساب الطلب.",
      };
    }
  }, [couponCode, deliveryZoneId, items, orderType]);
  const money = (value: number) =>
    formatMoney(value, tenant.settings.currencySymbol);
  const selectCustomer = (id: string) => {
    setCustomerId(id);
    const customer = customers.find((item) => item.id === id);
    if (customer) {
      setCustomerName(customer.name);
      setCustomerPhone(customer.phone ?? "");
      setCustomerAddress(customer.address ?? "");
    }
  };
  const quickCustomer = () => {
    try {
      const customer = checkoutService.createQuickCustomer({
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
      });
      setCustomerId(customer.id);
      toast.success("تمت إضافة العميل");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إضافة العميل");
    }
  };
  const openPayment = () => {
    if (!branch) return toast.error("لا يوجد فرع نشط.");
    if (!items.length) return toast.error("السلة فارغة.");
    if (orderType === "TABLE" && !tableId)
      return toast.error("اختر طاولة أولًا.");
    if (
      orderType === "DELIVERY" &&
      (!customerName.trim() ||
        !customerPhone.trim() ||
        !customerAddress.trim() ||
        !deliveryZoneId)
    )
      return toast.error("أكمل بيانات التوصيل المطلوبة.");
    if (calculation.error) return toast.error(calculation.error);
    setPaymentOpen(true);
  };
  const checkout = (payment: PaymentConfirmation) => {
    setSubmitting(true);
    try {
      const { order } = checkoutService.checkout({
        items,
        orderType,
        tableId: tableId || undefined,
        customerId: customerId || undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        customerAddress: customerAddress || undefined,
        deliveryZoneId: deliveryZoneId || undefined,
        couponCode: couponCode || undefined,
        paymentMethod: payment.method,
        paymentAllocations: payment.allocations,
        receivedAmount: payment.receivedAmount,
      });
      clearCart();
      resetDraft();
      useOrdersStore.getState().loadForTenant(tenant.id);
      toast.success(`تم إنشاء الطلب ${order.orderNumber} بنجاح`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إنشاء الطلب.");
    } finally {
      setSubmitting(false);
    }
  };
  const totals = calculation.result?.totals ?? {
    subtotal: 0,
    discount: 0,
    tax: 0,
    serviceCharge: 0,
    deliveryFee: 0,
    total: 0,
  };
  return (
    <AdminShell>
      <BranchRequired>
        <section
          dir="rtl"
          className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5"
        >
          <div className="mb-4">
            <p className="text-xs font-bold text-accent">
              المبيعات · {branch?.name}
            </p>
            <h1 className="mt-1 text-2xl font-black">نقطة البيع POS</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              الأسعار والتوفر من منيو الفرع الحالي.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
            <Card>
              <CardHeader className="border-b">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="بحث عن منتج"
                    className="pr-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((product) => (
                  <button
                    type="button"
                    key={product.id}
                    className="rounded-xl border p-4 text-right hover:bg-muted"
                    onClick={() =>
                      addItem({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        image: product.image,
                      })
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <b>{product.name}</b>
                      <span>{money(product.price)}</span>
                    </div>
                    <span className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <Plus className="h-3 w-3" />
                      إضافة للطلب
                    </span>
                  </button>
                ))}
              </CardContent>
              {!visible.length ? (
                <div className="border-t p-12 text-center text-sm text-muted-foreground">
                  لا توجد منتجات متاحة في منيو هذا الفرع.
                </div>
              ) : null}
            </Card>
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  الطلب الحالي <ShoppingCart className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ["TABLE", "داخل الكافيه"],
                      ["TAKEAWAY", "تيك أواي"],
                      ["DELIVERY", "توصيل"],
                    ] as const
                  ).map(([value, label]) => (
                    <Button
                      key={value}
                      type="button"
                      variant={orderType === value ? "default" : "outline"}
                      className="px-2 text-xs"
                      onClick={() => {
                        setOrderType(value);
                        setTableId("");
                        setDeliveryZoneId("");
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                {orderType === "TABLE" ? (
                  <label className="text-sm font-bold">
                    الطاولة
                    <select
                      value={tableId}
                      onChange={(event) => setTableId(event.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
                    >
                      <option value="">اختر طاولة</option>
                      {tables
                        .filter((table) => table.isActive)
                        .map((table) => (
                          <option key={table.id} value={table.id}>
                            طاولة {table.number}
                          </option>
                        ))}
                    </select>
                    {!tables.length ? (
                      <small className="mt-1 block text-destructive">
                        لا توجد طاولات في هذا الفرع.
                      </small>
                    ) : null}
                  </label>
                ) : null}
                <div className="space-y-2 rounded-xl border p-3">
                  <label className="text-sm font-bold">
                    اختيار عميل
                    <select
                      value={customerId}
                      onChange={(event) => selectCustomer(event.target.value)}
                      className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
                    >
                      <option value="">عميل غير مسجل</option>
                      {customers
                        .filter((customer) => customer.active)
                        .map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}{" "}
                            {customer.phone ? `· ${customer.phone}` : ""}
                          </option>
                        ))}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder="اسم العميل"
                    />
                    <Input
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      placeholder="الهاتف"
                    />
                  </div>
                  {orderType === "DELIVERY" ? (
                    <>
                      <Textarea
                        value={customerAddress}
                        onChange={(event) =>
                          setCustomerAddress(event.target.value)
                        }
                        placeholder="عنوان التوصيل"
                      />
                      <select
                        value={deliveryZoneId}
                        onChange={(event) =>
                          setDeliveryZoneId(event.target.value)
                        }
                        className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                      >
                        <option value="">اختر منطقة التوصيل</option>
                        {zones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name} · {money(zone.fee)}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={quickCustomer}
                    disabled={!customerName.trim()}
                  >
                    <UserPlus className="ml-2 h-4 w-4" />
                    إضافة عميل سريع
                  </Button>
                </div>
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId ?? "base"}`}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <b>{item.name}</b>
                        <button
                          type="button"
                          onClick={() => remove(item.productId)}
                          aria-label="حذف المنتج"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span>{money(item.price * item.quantity)}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => decrease(item.productId)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <b>{item.quantity}</b>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => increase(item.productId)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Input
                        value={item.notes ?? ""}
                        onChange={(event) =>
                          updateNotes(item.productId, event.target.value)
                        }
                        placeholder="ملاحظات المنتج"
                        className="mt-2 h-8 text-xs"
                      />
                    </div>
                  ))}
                  {!items.length ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                      السلة فارغة
                    </div>
                  ) : null}
                </div>
                <Input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="كود الخصم"
                />
                <div className="space-y-2 border-t pt-3 text-sm">
                  <Total
                    label="المجموع الفرعي"
                    value={money(totals.subtotal)}
                  />
                  <Total label="الخصم" value={`- ${money(totals.discount)}`} />
                  <Total label="الضريبة" value={money(totals.tax)} />
                  <Total
                    label="رسوم الخدمة"
                    value={money(totals.serviceCharge)}
                  />
                  <Total label="التوصيل" value={money(totals.deliveryFee)} />
                  <div className="flex justify-between text-lg font-black">
                    <span>الإجمالي</span>
                    <span>{money(totals.total)}</span>
                  </div>
                  {calculation.error && items.length ? (
                    <p className="text-xs font-bold text-destructive">
                      {calculation.error}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  className="w-full"
                  disabled={!items.length || submitting}
                  onClick={openPayment}
                >
                  {submitting ? "جارٍ الحفظ..." : "الدفع وإنشاء الطلب"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={!items.length}
                  onClick={() => {
                    clearCart();
                    resetDraft();
                  }}
                >
                  إلغاء الطلب
                </Button>
              </CardContent>
            </Card>
          </div>
          <PaymentDialog
            open={paymentOpen}
            total={totals.total}
            currencySymbol={tenant.settings.currencySymbol}
            busy={submitting}
            onOpenChange={setPaymentOpen}
            onConfirm={checkout}
          />
        </section>
      </BranchRequired>
    </AdminShell>
  );
}
function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <b>{value}</b>
    </div>
  );
}
