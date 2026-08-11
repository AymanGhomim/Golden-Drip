"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Printer, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { PermissionGate } from "@/components/access/permission-gate";
import { AppLogo } from "@/components/shared/app-logo";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/money";
import { normalizeTenantBranding } from "@/lib/tenant-branding";
import { useBranch } from "@/providers/branch-provider";
import { useTenant } from "@/providers/tenant-provider";
import { financeService } from "@/services/finance.service";
import {
  canTransitionOrderStatus,
  orderService,
} from "@/services/order.service";
import type { Order, OrderStatus } from "@/types/order.types";
const statusLabels: Record<OrderStatus, string> = {
  NEW: "جديد",
  ACCEPTED: "مقبول",
  PREPARING: "جاري التحضير",
  READY: "جاهز",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
  REFUNDED: "مسترجع",
};
const next: Partial<Record<OrderStatus, OrderStatus>> = {
  NEW: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
};
const sourceLabels = {
  POS: "نقطة البيع",
  QR_MENU: "QR",
  ONLINE_MENU: "المنيو الإلكتروني",
  MANUAL: "طلب يدوي",
};
const typeLabels = {
  TABLE: "داخل الكافيه",
  TAKEAWAY: "تيك أواي",
  DELIVERY: "توصيل",
};
export default function OrderDetailsPage() {
  const params = useParams<{ orderId: string }>();
  const { tenant } = useTenant();
  const { branch } = useBranch();
  const [order, setOrder] = useState<Order | undefined>();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [reason, setReason] = useState("");
  const reload = useCallback(
    () => setOrder(orderService.getById(params.orderId)),
    [params.orderId],
  );
  useEffect(() => {
    reload();
    window.addEventListener("orders:changed", reload);
    return () => window.removeEventListener("orders:changed", reload);
  }, [reload]);
  if (!order)
    return (
      <AdminShell>
        <div dir="rtl" className="mx-auto max-w-3xl p-12 text-center">
          <h1 className="text-2xl font-black">الطلب غير موجود</h1>
          <p className="mt-2 text-muted-foreground">
            الطلب لا ينتمي إلى الكافيه أو الفرع الحالي، أو تم حذفه.
          </p>
        </div>
      </AdminShell>
    );
  const branding = normalizeTenantBranding(tenant.branding);
  const payments = financeService
    .getPayments()
    .filter((p) => p.orderId === order.id);
  const refunds = financeService
    .getRefunds()
    .filter((r) => r.orderId === order.id);
  const paid = payments.reduce((s, p) => s + p.amount, 0);
  const refunded = refunds.reduce((s, r) => s + r.amount, 0);
  const move = () => {
    const target = next[order.status];
    if (!target) return;
    try {
      orderService.transition(order.id, target);
      reload();
      toast.success("تم تحديث حالة الطلب.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر التحديث.");
    }
  };
  const cancel = () => {
    try {
      orderService.cancel(order.id, reason);
      setCancelOpen(false);
      setConfirmCancel(false);
      reload();
      toast.success("تم إلغاء الطلب دون استرجاع مالي تلقائي.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر الإلغاء.");
    }
  };
  return (
    <AdminShell>
      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-5"
      >
        <Breadcrumbs items={[{ label: "الطلبات", href: "/admin/orders" }, { label: order.orderNumber }]} />
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-accent">تفاصيل الطلب</p>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black">{order.orderNumber}</h1>
              <StatusBadge status={order.status} />
            </div>
          </div>
          <div className="flex gap-2">
            <PermissionGate permission="orders.print">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="ml-2 h-4 w-4" />
                طباعة
              </Button>
            </PermissionGate>
            {next[order.status] ? (
              <PermissionGate permission="orders.update">
                <Button onClick={move}>
                  {statusLabels[next[order.status]!]}
                </Button>
              </PermissionGate>
            ) : null}
            {canTransitionOrderStatus(order.status, "CANCELLED") ? (
              <PermissionGate permission="orders.cancel">
                <Button
                  variant="destructive"
                  onClick={() => setCancelOpen(true)}
                >
                  إلغاء الطلب
                </Button>
              </PermissionGate>
            ) : null}
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Card>
              <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                <Info label="رقم الطلب" value={order.orderNumber} />
                <Info
                  label="الفرع"
                  value={branch?.name ?? order.branchId ?? "—"}
                />
                <Info
                  label="المصدر"
                  value={sourceLabels[order.source ?? "MANUAL"]}
                />
                <Info label="نوع الطلب" value={typeLabels[order.orderType]} />
                <Info
                  label="حالة الدفع"
                  value={order.paymentStatus ?? "PENDING"}
                />
                <Info label="الموظف" value={order.createdBy ?? "النظام"} />
                <Info label="العميل" value={order.customerName ?? "غير مسجل"} />
                <Info label="الهاتف" value={order.customerPhone ?? "—"} />
                <Info
                  label="الطاولة"
                  value={
                    order.orderType === "TABLE"
                      ? String(order.tableNumber)
                      : "—"
                  }
                />
                <Info
                  label="عنوان التوصيل"
                  value={order.customerAddress ?? "—"}
                />
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
                        سعر الوحدة:{" "}
                        {formatMoney(
                          item.unitPrice,
                          tenant.settings.currencySymbol,
                        )}
                      </p>
                      {item.selectedModifiers?.map((modifier) => (
                        <p
                          key={`${modifier.groupId}-${modifier.optionId}`}
                          className="text-xs text-muted-foreground"
                        >
                          {modifier.groupName}: {modifier.optionName}{" "}
                          {modifier.priceAdjustment
                            ? `(+${formatMoney(modifier.priceAdjustment, tenant.settings.currencySymbol)})`
                            : ""}
                        </p>
                      ))}
                      {item.addons?.map((addon) => (
                        <p
                          key={addon.id}
                          className="text-xs text-muted-foreground"
                        >
                          {addon.name} (+
                          {formatMoney(
                            addon.price,
                            tenant.settings.currencySymbol,
                          )}
                          )
                        </p>
                      ))}
                      {item.notes ? (
                        <p className="text-xs">ملاحظة: {item.notes}</p>
                      ) : null}
                    </div>
                    <b>
                      {formatMoney(
                        item.totalPrice,
                        tenant.settings.currencySymbol,
                      )}
                    </b>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 font-bold">مسار الطلب</h2>
                <div className="space-y-3">
                  {(
                    order.timeline ?? [
                      { status: order.status, at: order.createdAt },
                    ]
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
          </div>
          <div className="space-y-4">
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
                <PriceRow label="المجموع الفرعي" value={order.subtotal} />
                <PriceRow label="الخصم" value={-(order.discount ?? 0)} />
                <PriceRow
                  label="الكوبون"
                  value={-(order.couponDiscount ?? 0)}
                />
                <PriceRow label="الضريبة" value={order.tax ?? 0} />
                <PriceRow label="الخدمة" value={order.serviceCharge ?? 0} />
                <PriceRow label="التوصيل" value={order.deliveryFee ?? 0} />
                <PriceRow label="الإجمالي" value={order.total} strong />
                <PriceRow label="المدفوع" value={paid} />
                <PriceRow label="المسترجع" value={-refunded} />
                <PriceRow
                  label="المتاح للاسترجاع"
                  value={Math.max(0, paid - refunded)}
                />
                {branding.receipt?.footer ? (
                  <p className="border-t pt-3 text-center text-xs">
                    {branding.receipt.footer}
                  </p>
                ) : null}
              </CardContent>
            </Card>
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
                        {part.method}:{" "}
                        {formatMoney(
                          part.amount,
                          tenant.settings.currencySymbol,
                        )}
                      </p>
                    ))}
                  </div>
                ))}
                {!payments.length ? (
                  <p className="text-sm text-muted-foreground">
                    لا توجد عملية دفع مسجلة.
                  </p>
                ) : null}
                {paid - refunded > 0 && (
                  <PermissionGate permission="refunds.create">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/admin/payments">
                        <RotateCcw className="ml-2 h-4 w-4" />
                        فتح المدفوعات للاسترجاع
                      </Link>
                    </Button>
                  </PermissionGate>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إلغاء الطلب</DialogTitle>
              <DialogDescription>
                الإلغاء لا ينفذ استرجاعًا ماليًا تلقائيًا.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="سبب الإلغاء"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button
              variant="destructive"
              disabled={!reason.trim()}
              onClick={() => setConfirmCancel(true)}
            >
              متابعة
            </Button>
          </DialogContent>
        </Dialog>
        <ConfirmDialog
          open={confirmCancel}
          onOpenChange={setConfirmCancel}
          title="تأكيد إلغاء الطلب؟"
          description={`السبب: ${reason}`}
          confirmLabel="إلغاء الطلب"
          onConfirm={cancel}
        />
      </section>
    </AdminShell>
  );
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
  }: {
    label: string;
    value: number;
    strong?: boolean;
  }) {
    return (
      <div
        className={`flex justify-between ${strong ? "border-y py-2 text-lg font-black" : "text-sm"}`}
      >
        <span>{label}</span>
        <span>{formatMoney(value, tenant.settings.currencySymbol)}</span>
      </div>
    );
  }
}
