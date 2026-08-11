import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { PermissionGate } from "@/components/access/permission-gate";
import { AppLogo } from "@/components/shared/app-logo";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import type { Branch } from "@/types/branch.types";
import type { PaymentRecord } from "@/types/cafe-operations.types";
import type { Order } from "@/types/order.types";
import type { Tenant, TenantBranding } from "@/types/tenant.types";
import { orderSourceLabels, orderTypeLabels } from "@shared/presentation/order";

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}
function PriceRow({
  label,
  value,
  strong,
  currency,
}: {
  label: string;
  value: number;
  strong?: boolean;
  currency: string;
}) {
  return (
    <div
      className={`flex justify-between ${strong ? "border-y py-2 text-lg font-black" : "text-sm"}`}
    >
      <span>{label}</span>
      <span>{formatMoney(value, currency)}</span>
    </div>
  );
}

export function OrderInfoCard({
  order,
  branchName,
}: {
  order: Order;
  branchName?: string;
}) {
  return (
    <Card>
      <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <Info label="رقم الطلب" value={order.orderNumber} />
        <Info label="الفرع" value={branchName ?? order.branchId ?? "—"} />
        <Info
          label="المصدر"
          value={orderSourceLabels[order.source ?? "MANUAL"]}
        />
        <Info label="نوع الطلب" value={orderTypeLabels[order.orderType]} />
        <Info label="حالة الدفع" value={order.paymentStatus ?? "PENDING"} />
        <Info label="الموظف" value={order.createdBy ?? "النظام"} />
        <Info label="العميل" value={order.customerName ?? "غير مسجل"} />
        <Info label="الهاتف" value={order.customerPhone ?? "—"} />
        <Info
          label="الطاولة"
          value={order.orderType === "TABLE" ? String(order.tableNumber) : "—"}
        />
        <Info label="عنوان التوصيل" value={order.customerAddress ?? "—"} />
        <Info
          label="منطقة التوصيل"
          value={order.deliveryZoneName ?? order.deliveryZoneId ?? "—"}
        />
        <Info
          label="وقت الإنشاء"
          value={new Date(order.createdAt).toLocaleString("ar-EG")}
        />
      </CardContent>
    </Card>
  );
}

export function OrderItemsCard({
  order,
  currency,
}: {
  order: Order;
  currency: string;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-b p-4 font-bold">المنتجات</div>
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between gap-3 border-b p-4 last:border-0"
          >
            <div>
              <b>
                {item.quantity} × {item.productName}
              </b>
              <p className="text-xs text-muted-foreground">
                سعر الوحدة: {formatMoney(item.unitPrice, currency)}
              </p>
              {item.selectedModifiers?.map((modifier) => (
                <p
                  key={`${modifier.groupId}-${modifier.optionId}`}
                  className="text-xs text-muted-foreground"
                >
                  {modifier.groupName}: {modifier.optionName}{" "}
                  {modifier.priceAdjustment
                    ? `(+${formatMoney(modifier.priceAdjustment, currency)})`
                    : ""}
                </p>
              ))}
              {item.addons?.map((addon) => (
                <p key={addon.id} className="text-xs text-muted-foreground">
                  {addon.name} (+{formatMoney(addon.price, currency)})
                </p>
              ))}
              {item.notes ? (
                <p className="text-xs">ملاحظة: {item.notes}</p>
              ) : null}
            </div>
            <b>{formatMoney(item.totalPrice, currency)}</b>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function OrderTimelineCard({ order }: { order: Order }) {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="mb-3 font-bold">مسار الطلب</h2>
        <div className="space-y-3">
          {(
            order.timeline ?? [{ status: order.status, at: order.createdAt }]
          ).map((entry, index) => (
            <div
              key={`${entry.at}-${index}`}
              className="flex items-center justify-between border-b pb-2"
            >
              <div>
                <StatusBadge status={entry.status} />
                {entry.note ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.note}
                  </p>
                ) : null}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(entry.at).toLocaleString("ar-EG")}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function OrderReceiptCard({
  order,
  tenant,
  branch,
  branding,
  paid,
  refunded,
}: {
  order: Order;
  tenant: Tenant;
  branch: Branch | null;
  branding: TenantBranding;
  paid: number;
  refunded: number;
}) {
  const currency = tenant.settings.currencySymbol;
  return (
    <Card data-receipt>
      <CardContent className="space-y-3 p-5">
        <div className="border-b pb-3 text-center">
          <AppLogo className="justify-center" />
          <p className="mt-2 text-xs">{branch?.name}</p>
          <p className="text-xs text-muted-foreground">
            {branch?.address ?? tenant.contact?.address}
          </p>
          <p className="text-xs text-muted-foreground">
            {branch?.phone ?? tenant.contact?.phone}
          </p>
          {branding.receipt?.header ? (
            <p className="mt-2 font-bold">{branding.receipt.header}</p>
          ) : null}
        </div>
        <PriceRow
          label="المجموع الفرعي"
          value={order.subtotal}
          currency={currency}
        />
        <PriceRow
          label="الخصم"
          value={-(order.discount ?? 0)}
          currency={currency}
        />
        <PriceRow
          label="الكوبون"
          value={-(order.couponDiscount ?? 0)}
          currency={currency}
        />
        <PriceRow label="الضريبة" value={order.tax ?? 0} currency={currency} />
        <PriceRow
          label="الخدمة"
          value={order.serviceCharge ?? 0}
          currency={currency}
        />
        <PriceRow
          label="التوصيل"
          value={order.deliveryFee ?? 0}
          currency={currency}
        />
        <PriceRow
          label="الإجمالي"
          value={order.total}
          strong
          currency={currency}
        />
        <PriceRow label="المدفوع" value={paid} currency={currency} />
        <PriceRow label="المسترجع" value={-refunded} currency={currency} />
        <PriceRow
          label="المتاح للاسترجاع"
          value={Math.max(0, paid - refunded)}
          currency={currency}
        />
        {branding.receipt?.footer ? (
          <p className="border-t pt-3 text-center text-xs">
            {branding.receipt.footer}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function OrderPaymentsCard({
  payments,
  refundable,
  currency,
}: {
  payments: PaymentRecord[];
  refundable: boolean;
  currency: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <h2 className="font-bold">الدفع</h2>
        {payments.map((payment) => (
          <div key={payment.id} className="rounded border p-3 text-sm">
            <div className="flex justify-between">
              <span>{payment.method}</span>
              <StatusBadge status={payment.status} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {payment.transactionReference ??
                payment.transactionNumber ??
                payment.id}
            </p>
            {payment.allocations?.map((part) => (
              <p key={part.method} className="text-xs">
                {part.method}: {formatMoney(part.amount, currency)}
              </p>
            ))}
          </div>
        ))}
        {!payments.length ? (
          <p className="text-sm text-muted-foreground">
            لا توجد عملية دفع مسجلة.
          </p>
        ) : null}
        {refundable ? (
          <PermissionGate permission="refunds.create">
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/payments">
                <RotateCcw className="ml-2 h-4 w-4" />
                فتح المدفوعات للاسترجاع
              </Link>
            </Button>
          </PermissionGate>
        ) : null}
      </CardContent>
    </Card>
  );
}
