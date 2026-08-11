import { Minus, Plus, ShoppingCart, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { usePosPage } from "@/hooks/use-pos-page";

type Controller = ReturnType<typeof usePosPage>;
type Props = Pick<
  Controller,
  | "calculation"
  | "cancelDraft"
  | "changeOrderType"
  | "couponCode"
  | "customerAddress"
  | "customerId"
  | "customerName"
  | "customerPhone"
  | "customers"
  | "decrease"
  | "deliveryZoneId"
  | "increase"
  | "items"
  | "money"
  | "openPayment"
  | "orderType"
  | "quickCustomer"
  | "remove"
  | "selectCustomer"
  | "setCouponCode"
  | "setCustomerAddress"
  | "setCustomerName"
  | "setCustomerPhone"
  | "setDeliveryZoneId"
  | "setTableId"
  | "submitting"
  | "tableId"
  | "tables"
  | "totals"
  | "updateNotes"
  | "zones"
>;

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <b>{value}</b>
    </div>
  );
}

export function PosCart(props: Props) {
  return (
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
              variant={props.orderType === value ? "default" : "outline"}
              className="px-2 text-xs"
              onClick={() => props.changeOrderType(value)}
            >
              {label}
            </Button>
          ))}
        </div>
        {props.orderType === "TABLE" ? (
          <label className="text-sm font-bold">
            الطاولة
            <select
              value={props.tableId}
              onChange={(event) => props.setTableId(event.target.value)}
              className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
            >
              <option value="">اختر طاولة</option>
              {props.tables
                .filter((table) => table.isActive)
                .map((table) => (
                  <option key={table.id} value={table.id}>
                    طاولة {table.number}
                  </option>
                ))}
            </select>
            {!props.tables.length ? (
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
              value={props.customerId}
              onChange={(event) => props.selectCustomer(event.target.value)}
              className="mt-1 h-10 w-full rounded-lg border bg-background px-3"
            >
              <option value="">عميل غير مسجل</option>
              {props.customers
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
              value={props.customerName}
              onChange={(event) => props.setCustomerName(event.target.value)}
              placeholder="اسم العميل"
            />
            <Input
              value={props.customerPhone}
              onChange={(event) => props.setCustomerPhone(event.target.value)}
              placeholder="الهاتف"
            />
          </div>
          {props.orderType === "DELIVERY" ? (
            <>
              <Textarea
                value={props.customerAddress}
                onChange={(event) =>
                  props.setCustomerAddress(event.target.value)
                }
                placeholder="عنوان التوصيل"
              />
              <select
                value={props.deliveryZoneId}
                onChange={(event) =>
                  props.setDeliveryZoneId(event.target.value)
                }
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
              >
                <option value="">اختر منطقة التوصيل</option>
                {props.zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} · {props.money(zone.fee)}
                  </option>
                ))}
              </select>
            </>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={props.quickCustomer}
            disabled={!props.customerName.trim()}
          >
            <UserPlus className="ml-2 h-4 w-4" />
            إضافة عميل سريع
          </Button>
        </div>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {props.items.map((item) => {
            const itemId = item.cartId ?? item.productId;
            return (
              <div
                key={
                  item.cartId ?? `${item.productId}-${item.variantId ?? "base"}`
                }
                className="rounded-lg border p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <b>{item.name}</b>
                  <button
                    type="button"
                    onClick={() => props.remove(itemId)}
                    aria-label="حذف المنتج"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>{props.money(item.price * item.quantity)}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => props.decrease(itemId)}
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
                      onClick={() => props.increase(itemId)}
                      aria-label={`زيادة كمية ${item.name}`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Input
                  value={item.notes ?? ""}
                  onChange={(event) =>
                    props.updateNotes(itemId, event.target.value)
                  }
                  placeholder="ملاحظات المنتج"
                  className="mt-2 h-8 text-xs"
                />
                {item.selectedModifiers?.length ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.selectedModifiers
                      .map(
                        (modifier) =>
                          `${modifier.groupName}: ${modifier.optionName}${modifier.priceAdjustment ? ` (+${props.money(modifier.priceAdjustment)})` : ""}`,
                      )
                      .join(" · ")}
                  </p>
                ) : null}
              </div>
            );
          })}
          {!props.items.length ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              السلة فارغة
            </div>
          ) : null}
        </div>
        <Input
          value={props.couponCode}
          onChange={(event) => props.setCouponCode(event.target.value)}
          placeholder="كود الخصم"
        />
        <div className="space-y-2 border-t pt-3 text-sm">
          <Total
            label="المجموع الفرعي"
            value={props.money(props.totals.subtotal)}
          />
          <Total
            label="الخصم"
            value={`- ${props.money(props.totals.discount)}`}
          />
          <Total label="الضريبة" value={props.money(props.totals.tax)} />
          <Total
            label="رسوم الخدمة"
            value={props.money(props.totals.serviceCharge)}
          />
          <Total
            label="التوصيل"
            value={props.money(props.totals.deliveryFee)}
          />
          <div className="flex justify-between text-lg font-black">
            <span>الإجمالي</span>
            <span>{props.money(props.totals.total)}</span>
          </div>
          {props.calculation.error && props.items.length ? (
            <p className="text-xs font-bold text-destructive">
              {props.calculation.error}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          className="w-full"
          disabled={!props.items.length || props.submitting}
          onClick={props.openPayment}
        >
          {props.submitting ? "جارٍ الحفظ..." : "الدفع وإنشاء الطلب"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={!props.items.length}
          onClick={props.cancelDraft}
        >
          إلغاء الطلب
        </Button>
      </CardContent>
    </Card>
  );
}
