import {
  Banknote,
  CreditCard,
  MapPin,
  MessageSquareText,
  PackageCheck,
  Phone,
  Store,
  Truck,
  User,
} from "lucide-react";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { useCustomerCart } from "@/hooks/use-customer-cart";

type Cart = ReturnType<typeof useCustomerCart>;
type Props = Pick<
  Cart,
  | "customerAddress"
  | "customerContext"
  | "customerName"
  | "customerNotes"
  | "customerPhone"
  | "deliveryZoneId"
  | "deliveryZones"
  | "items"
  | "locale"
  | "lockedOrderType"
  | "orderText"
  | "orderType"
  | "paymentMethod"
  | "scannedTableNumber"
  | "serviceTax"
  | "serviceTaxPercent"
  | "setCustomerAddress"
  | "setCustomerName"
  | "setCustomerNotes"
  | "setCustomerPhone"
  | "setDeliveryZoneId"
  | "setOrderType"
  | "setPaymentMethod"
  | "submitOrder"
  | "submitting"
  | "subtotal"
  | "text"
  | "total"
  | "totalItems"
>;

export function CustomerCheckoutSummary(props: Props) {
  const serviceTaxLabel = props.locale === "en" ? "Service" : "الخدمة";
  return (
    <Card className="h-fit overflow-hidden rounded-md shadow-sm lg:sticky lg:top-24">
      <CardContent className="space-y-5 p-5">
        <div>
          <h2 className="text-lg font-black">{props.text.summary}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {props.text.items}: {props.totalItems}
          </p>
        </div>
        <div className="space-y-3 rounded-md border bg-background/60 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{props.text.subtotal}</span>
            <Price value={props.subtotal} locale={props.locale} />
          </div>
          {props.serviceTaxPercent > 0 ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {serviceTaxLabel} ({props.serviceTaxPercent}%)
              </span>
              <Price value={props.serviceTax} locale={props.locale} />
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t pt-3 text-lg font-black dark:border-white/10">
            <span>{props.text.total}</span>
            <Price
              value={props.total}
              locale={props.locale}
              className="text-xl"
            />
          </div>
        </div>
        <div className="space-y-4 rounded-md border bg-background/60 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-accent" />
            <p className="text-sm font-bold">{props.orderText.orderType}</p>
          </div>
          {props.orderType === null ? (
            <div className="flex items-center justify-center rounded-md border border-accent/25 bg-accent/8 p-3 text-sm">
              <span className="rounded-full bg-background px-4 py-1.5 text-xs font-black shadow-sm">
                {props.scannedTableNumber
                  ? `${props.orderText.tablePrefix} #${props.scannedTableNumber}`
                  : props.orderText.tableFallback}
              </span>
            </div>
          ) : null}
          {!props.customerContext?.table ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                disabled={props.lockedOrderType}
                variant={props.orderType === "delivery" ? "default" : "outline"}
                className="h-11 gap-2 rounded-md text-xs font-bold"
                onClick={() => props.setOrderType("delivery")}
              >
                <Truck className="h-4 w-4" />
                {props.orderText.delivery}
              </Button>
              <Button
                type="button"
                disabled={props.lockedOrderType}
                variant={props.orderType === "takeaway" ? "default" : "outline"}
                className="h-11 gap-2 rounded-md text-xs font-bold"
                onClick={() => props.setOrderType("takeaway")}
              >
                <Store className="h-4 w-4" />
                {props.orderText.takeaway}
              </Button>
            </div>
          ) : null}
          <div className="space-y-3">
            <p className="text-sm font-bold">{props.orderText.customerInfo}</p>
            <div className="space-y-2">
              <Label
                htmlFor="customer-name"
                className="flex items-center gap-2 text-xs font-bold"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                {props.orderText.name}
              </Label>
              <Input
                id="customer-name"
                name="customerName"
                autoComplete="name"
                value={props.customerName}
                onChange={(event) => props.setCustomerName(event.target.value)}
              />
            </div>
            {props.orderType ? (
              <div className="space-y-2">
                <Label
                  htmlFor="customer-phone"
                  className="flex items-center gap-2 text-xs font-bold"
                >
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {props.orderText.phone}
                </Label>
                <Input
                  id="customer-phone"
                  name="customerPhone"
                  type="tel"
                  autoComplete="tel"
                  value={props.customerPhone}
                  onChange={(event) =>
                    props.setCustomerPhone(event.target.value)
                  }
                />
              </div>
            ) : null}
            {props.orderType === "delivery" ? (
              <div className="space-y-2">
                <Label
                  htmlFor="customer-address"
                  className="flex items-center gap-2 text-xs font-bold"
                >
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {props.orderText.address}
                </Label>
                <Textarea
                  id="customer-address"
                  name="customerAddress"
                  placeholder={props.orderText.addressHint}
                  className="min-h-20 resize-none"
                  value={props.customerAddress}
                  onChange={(event) =>
                    props.setCustomerAddress(event.target.value)
                  }
                />
                <select
                  value={props.deliveryZoneId}
                  onChange={(event) =>
                    props.setDeliveryZoneId(event.target.value)
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">اختر منطقة التوصيل</option>
                  {props.deliveryZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} · {zone.fee}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="space-y-2">
              <Label
                htmlFor="customer-notes"
                className="flex items-center gap-2 text-xs font-bold"
              >
                <MessageSquareText className="h-3.5 w-3.5 text-muted-foreground" />
                {props.orderText.notes}
              </Label>
              <Textarea
                id="customer-notes"
                name="customerNotes"
                placeholder={props.orderText.notesHint}
                className="min-h-20 resize-none"
                value={props.customerNotes}
                onChange={(event) => props.setCustomerNotes(event.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-bold">{props.text.payment}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={props.paymentMethod === "cash" ? "default" : "outline"}
              className="h-11 gap-2 rounded-md text-xs font-bold"
              onClick={() => props.setPaymentMethod("cash")}
            >
              <Banknote className="h-4 w-4" />
              {props.text.cash}
            </Button>
            <Button
              type="button"
              disabled
              title={
                props.locale === "ar"
                  ? "الدفع الإلكتروني يحتاج Backend وبوابة دفع حقيقية"
                  : "Online payment requires a backend and a real gateway"
              }
              variant={
                props.paymentMethod === "instapay" ? "default" : "outline"
              }
              className="h-11 gap-2 rounded-md text-xs font-bold"
              onClick={() => props.setPaymentMethod("instapay")}
            >
              <CreditCard className="h-4 w-4" />
              {props.text.instapay}
            </Button>
          </div>
        </div>
        <Button
          type="button"
          disabled={props.submitting || !props.items.length}
          onClick={props.submitOrder}
          className="h-12 w-full rounded-md bg-accent font-bold text-accent-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent/90"
        >
          {props.submitting
            ? props.locale === "ar"
              ? "جارٍ إرسال الطلب..."
              : "Placing order..."
            : props.text.checkout}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {props.locale === "ar"
            ? "سيتم تسجيل الطلب محليًا والدفع نقدًا عند الكاشير أو الاستلام. الدفع الإلكتروني غير متاح حتى ربط بوابة دفع."
            : "The order is stored locally and paid in cash at the cafe or on delivery. Online payment requires a gateway."}
        </p>
      </CardContent>
    </Card>
  );
}
