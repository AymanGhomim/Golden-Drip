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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatMoney } from "@/lib/money";
import { useBranch } from "@/providers/branch-provider";
import { useTenant } from "@/providers/tenant-provider";
import { cafeDataService } from "@/services/cafe-data.service";
import { cafeOperationsService } from "@/services/cafe-operations.service";
import { checkoutService } from "@/services/checkout.service";
import { modifierService } from "@/services/modifier.service";
import { useCartStore } from "@/store/cart.store";
import { useOrdersStore } from "@/store/orders.store";
import type {
  Customer,
  DeliveryZone,
  ModifierGroup,
} from "@/types/cafe-operations.types";
import type { OrderType } from "@/types/order.types";
import type { Product } from "@/types/product.types";
import { useSearchParams } from "next/navigation";

export default function PosPage() {
  const searchParams = useSearchParams();
  const manualOrder = searchParams.get("source") === "manual";
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [modifierSelections, setModifierSelections] = useState<
    Record<string, string[]>
  >({});
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
          customerId || undefined,
        ),
        error: "",
      };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : "تعذر حساب الطلب.",
      };
    }
  }, [couponCode, customerId, deliveryZoneId, items, orderType]);
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
  const chooseProduct = (product: Product) => {
    const groups = modifierService.getForProduct(product.id);
    if (!groups.length) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      });
      return;
    }
    setSelectedProduct(product);
    setModifierGroups(groups);
    setModifierSelections({});
  };
  const toggleModifier = (group: ModifierGroup, optionId: string) => {
    setModifierSelections((current) => {
      const selected = current[group.id] ?? [];
      const next =
        group.maxSelections === 1
          ? [optionId]
          : selected.includes(optionId)
            ? selected.filter((id) => id !== optionId)
            : [...selected, optionId];
      return { ...current, [group.id]: next };
    });
  };
  const confirmModifiers = () => {
    if (!selectedProduct) return;
    try {
      const selectedModifiers = modifierService.validateAndSnapshot(
        selectedProduct.id,
        Object.entries(modifierSelections).map(([groupId, optionIds]) => ({
          groupId,
          optionIds,
        })),
      );
      addItem({
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: 1,
        image: selectedProduct.image,
        selectedModifiers,
      });
      setSelectedProduct(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر تطبيق الاختيارات.",
      );
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
        source: manualOrder ? "MANUAL" : "POS",
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
            <h1 className="mt-1 text-2xl font-black">
              {manualOrder ? "إضافة طلب يدوي" : "نقطة البيع POS"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              الأسعار والتوفر من منيو الفرع الحالي.
            </p>
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
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
                    onClick={() => chooseProduct(product)}
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
            <Card className="h-fit xl:sticky xl:top-4">
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
                      key={
                        item.cartId ??
                        `${item.productId}-${item.variantId ?? "base"}`
                      }
                      className="rounded-lg border p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <b>{item.name}</b>
                        <button
                          type="button"
                          onClick={() => remove(item.cartId ?? item.productId)}
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
                            onClick={() =>
                              decrease(item.cartId ?? item.productId)
                            }
                            aria-label={`تقليل كمية ${item.name}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <b>{item.quantity}</b>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              increase(item.cartId ?? item.productId)
                            }
                            aria-label={`زيادة كمية ${item.name}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Input
                        value={item.notes ?? ""}
                        onChange={(event) =>
                          updateNotes(
                            item.cartId ?? item.productId,
                            event.target.value,
                          )
                        }
                        placeholder="ملاحظات المنتج"
                        className="mt-2 h-8 text-xs"
                      />
                      {item.selectedModifiers?.length ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {item.selectedModifiers
                            .map(
                              (modifier) =>
                                `${modifier.groupName}: ${modifier.optionName}${modifier.priceAdjustment ? ` (+${money(modifier.priceAdjustment)})` : ""}`,
                            )
                            .join(" · ")}
                        </p>
                      ) : null}
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
          <Dialog
            open={Boolean(selectedProduct)}
            onOpenChange={(open) => !open && setSelectedProduct(null)}
          >
            <DialogContent dir="rtl" className="max-w-lg">
              <DialogHeader>
                <DialogTitle>تخصيص {selectedProduct?.name}</DialogTitle>
                <DialogDescription>
                  اختر الإضافات المطلوبة قبل إضافة المنتج إلى الطلب.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {modifierGroups.map((group) => (
                  <div key={group.id}>
                    <div className="mb-2 flex justify-between">
                      <b>{group.name}</b>
                      <span className="text-xs text-muted-foreground">
                        {group.required ? "مطلوب" : "اختياري"} · حد أقصى{" "}
                        {group.maxSelections}
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.options.map((option) => (
                        <Button
                          key={option.id}
                          type="button"
                          variant={
                            (modifierSelections[group.id] ?? []).includes(
                              option.id,
                            )
                              ? "default"
                              : "outline"
                          }
                          disabled={!option.available}
                          onClick={() => toggleModifier(group, option.id)}
                          className="justify-between"
                        >
                          <span>{option.name}</span>
                          <span>
                            {option.priceAdjustment
                              ? `+${money(option.priceAdjustment)}`
                              : "بدون زيادة"}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={confirmModifiers}>إضافة إلى الطلب</Button>
            </DialogContent>
          </Dialog>
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
