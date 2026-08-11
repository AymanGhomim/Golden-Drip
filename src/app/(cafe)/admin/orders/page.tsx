"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Download, Eye, Plus, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/admin-shell";
import { PermissionGate } from "@/components/access/permission-gate";
import { AppLogo } from "@/components/shared/app-logo";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
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
import { useOrdersStore } from "@/store/orders.store";
import { orderService } from "@/services/order.service";
import { canTransitionOrderStatus } from "@/services/order.service";
import { reportService } from "@/services/report.service";
import { useTenant } from "@/providers/tenant-provider";
import { useBranch } from "@/providers/branch-provider";
import { normalizeTenantBranding } from "@/lib/tenant-branding";
import { usePagination } from "@/hooks/use-pagination";
import type {
  Order,
  OrderSource,
  OrderStatus,
  OrderType,
} from "@/types/order.types";

const statusLabels: Record<OrderStatus, string> = {
  NEW: "جديد",
  ACCEPTED: "مقبول",
  PREPARING: "جاري التحضير",
  READY: "جاهز",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
  REFUNDED: "مسترجع",
};
const sourceLabels: Record<OrderSource, string> = {
  POS: "نقطة البيع",
  QR_MENU: "QR",
  ONLINE_MENU: "المنيو الإلكتروني",
  MANUAL: "طلب يدوي",
};
const typeLabels: Record<OrderType, string> = {
  TABLE: "داخل الكافيه",
  TAKEAWAY: "تيك أواي",
  DELIVERY: "توصيل",
};
const statusStyle: Record<OrderStatus, string> = {
  NEW: "bg-sky-500/15 text-sky-700",
  ACCEPTED: "bg-indigo-500/15 text-indigo-700",
  PREPARING: "bg-amber-500/15 text-amber-700",
  READY: "bg-emerald-500/15 text-emerald-700",
  COMPLETED: "bg-stone-500/15 text-stone-700",
  CANCELLED: "bg-red-500/15 text-red-700",
  REFUNDED: "bg-red-500/15 text-red-700",
};
const money = (value: number) => `${value.toLocaleString("ar-EG")} ج.م`;
const tabs: Array<[string, string]> = [
  ["ALL", "الكل"],
  ["NEW", "جديد"],
  ["ACCEPTED", "مقبول"],
  ["PREPARING", "جاري التحضير"],
  ["READY", "جاهز"],
  ["COMPLETED", "مكتمل"],
  ["CANCELLED", "ملغي"],
  ["REFUNDED", "مسترجع"],
];

export default function OrdersPage() {
  const orders = useOrdersStore((state) => state.orders);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [employeeFilter, setEmployeeFilter] = useState("ALL");
  useEffect(() => {
    const reload = () => {
      setSelectedOrder(null);
      setCancelTarget(null);
      useOrdersStore.getState().loadForTenant();
    };
    reload();
    window.addEventListener("orders:changed", reload);
    window.addEventListener("tenant:changed", reload);
    window.addEventListener("branch:changed", reload);
    return () => {
      window.removeEventListener("orders:changed", reload);
      window.removeEventListener("tenant:changed", reload);
      window.removeEventListener("branch:changed", reload);
    };
  }, []);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const search =
          `${order.orderNumber} ${order.customerName ?? ""} ${order.customerPhone ?? ""} ${order.tableNumber}`.toLowerCase();
        return (
          (!query.trim() || search.includes(query.trim().toLowerCase())) &&
          (tab === "ALL" || order.status === tab) &&
          (typeFilter === "ALL" || order.orderType === typeFilter) &&
          (sourceFilter === "ALL" || order.source === sourceFilter) &&
          (paymentFilter === "ALL" || order.paymentStatus === paymentFilter) &&
          (methodFilter === "ALL" || order.paymentMethod === methodFilter) &&
          (employeeFilter === "ALL" || order.createdBy === employeeFilter) &&
          (!dateFrom || order.createdAt.slice(0, 10) >= dateFrom) &&
          (!dateTo || order.createdAt.slice(0, 10) <= dateTo)
        );
      }),
    [
      dateFrom,
      dateTo,
      employeeFilter,
      methodFilter,
      orders,
      paymentFilter,
      query,
      sourceFilter,
      tab,
      typeFilter,
    ],
  );
  const pagination = usePagination(filteredOrders, [query, tab, typeFilter, sourceFilter, paymentFilter, methodFilter, employeeFilter, dateFrom, dateTo].join(":"));

  function nextStatus(order: Order) {
    const sequence: OrderStatus[] = [
      "NEW",
      "ACCEPTED",
      "PREPARING",
      "READY",
      "COMPLETED",
    ];
    const index = sequence.indexOf(order.status);
    if (index >= 0 && index < sequence.length - 1)
      try {
        orderService.transition(order.id, sequence[index + 1]);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "تعذر تحديث الحالة.",
        );
      }
  }
  function confirmCancellation() {
    if (!cancelTarget) return;
    orderService.cancel(cancelTarget.id, cancelReason);
    setCancelTarget(null);
    setCancelReason("");
    setCancelConfirmOpen(false);
    window.dispatchEvent(new Event("orders:changed"));
    toast.success("تم إلغاء الطلب");
  }
  function exportOrders() {
    try {
      const csv = reportService.toCsv(
        filteredOrders.map((order) => ({
          رقم_الطلب: order.orderNumber,
          التاريخ: order.createdAt,
          المصدر: order.source,
          النوع: order.orderType,
          العميل: order.customerName,
          الإجمالي: order.total,
          الدفع: order.paymentStatus,
          الحالة: order.status,
        })),
      );
      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر التصدير.");
    }
  }

  return (
    <AdminShell>
      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5"
      >
        <div className="mb-4 flex flex-col justify-between gap-3 rounded-xl border bg-card p-5 shadow-sm lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold text-accent">المبيعات</p>
            <h1 className="mt-1 text-2xl font-black">الطلبات</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              كل الطلبات في نظام موحد: نقطة البيع وQR والمنيو الإلكتروني والطلب
              اليدوي.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PermissionGate permission="orders.create">
              <Button asChild className="h-10 rounded-lg">
                <Link href="/admin/pos?source=manual">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة طلب يدوي
                </Link>
              </Button>
            </PermissionGate>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg"
              onClick={() => {
                useOrdersStore.getState().loadForTenant();
                toast.success("تم تحديث قائمة الطلبات");
              }}
            >
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg"
              disabled={!filteredOrders.length}
              onClick={exportOrders}
            >
              <Download className="ml-2 h-4 w-4" />
              تصدير
            </Button>
          </div>
        </div>
        <Card className="overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <div className="scrollbar-hidden flex gap-1 overflow-x-auto border-b p-3">
              {tabs.map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setTab(value)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${tab === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {label}
                  <span className="mr-1 opacity-70">
                    (
                    {value === "ALL"
                      ? orders.length
                      : orders.filter((order) => order.status === value).length}
                    )
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 border-b p-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ابحث برقم الطلب أو العميل أو الهاتف أو الطاولة"
                  className="h-11 rounded-lg"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <FilterSelect
                  label="نوع الطلب"
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={[
                    ["ALL", "كل الأنواع"],
                    ["TABLE", "داخل الكافيه"],
                    ["TAKEAWAY", "تيك أواي"],
                    ["DELIVERY", "توصيل"],
                  ]}
                />
                <FilterSelect
                  label="مصدر الطلب"
                  value={sourceFilter}
                  onChange={setSourceFilter}
                  options={[
                    ["ALL", "كل المصادر"],
                    ["POS", "نقطة البيع"],
                    ["QR_MENU", "QR"],
                    ["ONLINE_MENU", "المنيو الإلكتروني"],
                    ["MANUAL", "طلب يدوي"],
                  ]}
                />
                <FilterSelect
                  label="حالة الدفع"
                  value={paymentFilter}
                  onChange={setPaymentFilter}
                  options={[
                    ["ALL", "كل الحالات"],
                    ["PENDING", "معلق"],
                    ["PAID", "مدفوع"],
                    ["REFUNDED", "مسترجع"],
                  ]}
                />
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-muted-foreground">
                    من تاريخ
                  </label>
                  <Input
                    type="date"
                    className="h-10 rounded-lg"
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-muted-foreground">
                    إلى تاريخ
                  </label>
                  <Input
                    type="date"
                    className="h-10 rounded-lg"
                    value={dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                  />
                </div>
                <FilterSelect
                  label="طريقة الدفع"
                  value={methodFilter}
                  onChange={setMethodFilter}
                  options={[
                    ["ALL", "كل الطرق"],
                    ["CASH", "نقدي"],
                    ["CARD", "بطاقة"],
                    ["WALLET", "محفظة"],
                    ["ONLINE", "إلكتروني"],
                    ["MIXED", "مختلط"],
                  ]}
                />
                <FilterSelect
                  label="الموظف"
                  value={employeeFilter}
                  onChange={setEmployeeFilter}
                  options={[
                    ["ALL", "كل الموظفين"],
                    ...Array.from(
                      new Set(
                        orders.map((order) => order.createdBy).filter(Boolean),
                      ),
                    ).map((employee) => [employee!, employee!]),
                  ]}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-right text-xs">
                <thead className="bg-muted/50 text-[11px] text-muted-foreground">
                  <tr>
                    {[
                      "رقم الطلب",
                      "المصدر",
                      "النوع",
                      "العميل / الطاولة",
                      "العناصر",
                      "الإجمالي",
                      "حالة الدفع",
                      "حالة الطلب",
                      "الوقت",
                      "الإجراءات",
                    ].map((heading) => (
                      <th key={heading} className="px-3 py-3 font-bold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagination.items.map((order) => (
                    <tr key={order.id} className="border-t align-middle">
                      <td className="px-3 py-3 font-black">
                        {order.orderNumber}
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="outline">
                          {sourceLabels[order.source ?? "MANUAL"]}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        {typeLabels[order.orderType]}
                      </td>
                      <td className="px-3 py-3">
                        <b>
                          {order.customerName ||
                            (order.orderType === "TABLE"
                              ? `طاولة ${order.tableNumber}`
                              : "عميل غير مسجل")}
                        </b>
                        {order.customerPhone ? (
                          <small className="mt-1 block text-muted-foreground">
                            {order.customerPhone}
                          </small>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0,
                        )}
                      </td>
                      <td className="px-3 py-3 font-black">
                        {money(order.total)}
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          className={
                            order.paymentStatus === "PAID"
                              ? "bg-emerald-500/15 text-emerald-700"
                              : "bg-amber-500/15 text-amber-700"
                          }
                        >
                          {order.paymentStatus === "PAID"
                            ? "مدفوع"
                            : order.paymentStatus === "REFUNDED"
                              ? "مسترجع"
                              : "معلق"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          className={`${statusStyle[order.status]} hover:${statusStyle[order.status]}`}
                        >
                          {statusLabels[order.status]}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleTimeString("ar-EG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <PermissionGate permission="orders.view">
                            <Button
                              asChild
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              aria-label="عرض التفاصيل"
                            >
                              <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </PermissionGate>
                          <PermissionGate permission="orders.cancel">
                            <Button
                              type="button"
                              className="h-8 rounded-md px-2 text-[11px]"
                              onClick={() => nextStatus(order)}
                              disabled={
                                order.status === "COMPLETED" ||
                                order.status === "CANCELLED"
                              }
                            >
                              تحديث الحالة
                            </Button>
                          </PermissionGate>
                          <PermissionGate permission="orders.cancel">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => {
                                setCancelTarget(order);
                                setCancelReason("");
                              }}
                              disabled={
                                order.status === "COMPLETED" ||
                                order.status === "CANCELLED"
                              }
                              aria-label="إلغاء"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredOrders.length ? (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  لا توجد طلبات مطابقة للفلاتر الحالية.
                </div>
              ) : null}
              <Pagination {...pagination.state} onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
            </div>
          </CardContent>
        </Card>
        <Dialog
          open={Boolean(selectedOrder)}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
        >
          <DialogContent
            dir="rtl"
            className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl"
          >
            <DialogHeader>
              <DialogTitle>
                تفاصيل الطلب {selectedOrder?.orderNumber}
              </DialogTitle>
              <DialogDescription>
                معلومات الطلب، المنتجات، الدفع، وتسلسل الحالة.
              </DialogDescription>
            </DialogHeader>
            {selectedOrder ? (
              <OrderDetails
                order={selectedOrder}
                onStatus={(status) => {
                  try {
                    orderService.transition(selectedOrder.id, status);
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "تعذر تحديث الحالة.",
                    );
                  }
                }}
              />
            ) : null}
          </DialogContent>
        </Dialog>
        <Dialog
          open={Boolean(cancelTarget)}
          onOpenChange={(value) => !value && setCancelTarget(null)}
        >
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إلغاء الطلب {cancelTarget?.orderNumber}</DialogTitle>
              <DialogDescription>
                إلغاء الطلب لا يعني استرجاع المبلغ المدفوع تلقائيًا.
              </DialogDescription>
            </DialogHeader>
            <label className="text-sm font-bold">
              سبب الإلغاء *
              <Input
                className="mt-1"
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
              />
            </label>
            <Button
              variant="destructive"
              disabled={!cancelReason.trim()}
              onClick={() => setCancelConfirmOpen(true)}
            >
              متابعة الإلغاء
            </Button>
          </DialogContent>
        </Dialog>
        <ConfirmDialog
          open={cancelConfirmOpen}
          onOpenChange={setCancelConfirmOpen}
          title="إلغاء الطلب؟"
          description={`سيتم إلغاء الطلب بسبب: ${cancelReason}. عملية رد المبلغ تُسجل بشكل منفصل.`}
          confirmLabel="إلغاء الطلب"
          onConfirm={confirmCancellation}
        />
      </section>
    </AdminShell>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border bg-background px-3 text-xs outline-none"
      >
        {options.map(([option, text]) => (
          <option key={option} value={option}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}
function OrderDetails({
  order,
  onStatus,
}: {
  order: Order;
  onStatus: (status: OrderStatus) => void;
}) {
  const { tenant } = useTenant();
  const { branch } = useBranch();
  const branding = normalizeTenantBranding(tenant.branding);
  return (
    <div className="space-y-4" data-receipt>
      <div className="border-b pb-4 text-center">
        <AppLogo className="justify-center" />
        <p className="mt-2 text-xs text-muted-foreground">{branch?.name}</p>
        {branch?.address || tenant.contact?.address ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {branch?.address || tenant.contact?.address}
          </p>
        ) : null}
        {branch?.phone || tenant.contact?.phone ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {branch?.phone || tenant.contact?.phone}
          </p>
        ) : null}
        {branding.receipt?.header ? (
          <p className="mt-3 text-sm font-bold text-primary">
            {branding.receipt.header}
          </p>
        ) : null}
      </div>
      <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-3">
        <Info label="المصدر" value={sourceLabels[order.source ?? "MANUAL"]} />
        <Info label="النوع" value={typeLabels[order.orderType]} />
        <Info label="الموظف" value={order.createdBy ?? "النظام"} />
        <Info label="العميل" value={order.customerName ?? "غير مسجل"} />
        <Info
          label="الطاولة"
          value={
            order.orderType === "TABLE" ? `طاولة ${order.tableNumber}` : "—"
          }
        />
        <Info
          label="التاريخ"
          value={new Date(order.createdAt).toLocaleString("ar-EG")}
        />
      </div>
      <div className="divide-y rounded-lg border">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 p-3"
          >
            <div>
              <p className="text-sm font-bold">
                {item.quantity} × {item.productName}
              </p>
              {item.notes ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.notes}
                </p>
              ) : null}
            </div>
            <b>{money(item.totalPrice)}</b>
          </div>
        ))}
      </div>
      <div className="space-y-2 rounded-lg border p-4 text-sm">
        <Info label="المجموع الفرعي" value={money(order.subtotal)} />
        <Info label="الإجمالي" value={money(order.total)} />
        <Info
          label="طريقة الدفع"
          value={
            order.paymentMethod === "CARD"
              ? "بطاقة"
              : order.paymentMethod === "WALLET"
                ? "محفظة"
                : "نقدي"
          }
        />
        <Info
          label="حالة الدفع"
          value={order.paymentStatus === "PAID" ? "مدفوع" : "معلق"}
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-bold">تسلسل الطلب</p>
        <PermissionGate permission="orders.update">
          <div className="flex flex-wrap gap-2">
            {(
              [
                "NEW",
                "ACCEPTED",
                "PREPARING",
                "READY",
                "COMPLETED",
              ] as OrderStatus[]
            ).map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => onStatus(status)}
                disabled={
                  status !== order.status &&
                  !canTransitionOrderStatus(order.status, status)
                }
                className={`rounded-full border px-3 py-2 text-xs font-bold ${order.status === status ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>
        </PermissionGate>
      </div>
      <PermissionGate permission="orders.print">
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full rounded-lg"
          onClick={() => window.print()}
        >
          طباعة الفاتورة
        </Button>
      </PermissionGate>
      {branding.receipt?.footer ? (
        <p className="border-t pt-3 text-center text-xs text-muted-foreground">
          {branding.receipt.footer}
        </p>
      ) : null}
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
