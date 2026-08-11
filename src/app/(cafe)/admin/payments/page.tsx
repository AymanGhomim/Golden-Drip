"use client";

import { useEffect, useState } from "react";
import { Eye, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
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
import { useCurrentEmployee } from "@/providers/current-employee-provider";
import { useTenant } from "@/providers/tenant-provider";
import { branchService } from "@/services/branch.service";
import { customerService } from "@/services/customer.service";
import { employeeService } from "@/services/employee.service";
import { financeService } from "@/services/finance.service";
import type { PaymentRecord } from "@/types/cafe-operations.types";
import { usePagination } from "@/hooks/use-pagination";
import { formatDateTime } from "@/lib/formatters";

const methods: Record<string, string> = {
  CASH: "نقدي",
  CARD: "بطاقة",
  WALLET: "محفظة",
  ONLINE: "دفع إلكتروني",
  MIXED: "دفع مختلط",
};

export default function PaymentsPage() {
  const { tenant } = useTenant();
  const access = useCurrentEmployee();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [confirmRefund, setConfirmRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [date, setDate] = useState("");
  const reload = () => setPayments(financeService.getPayments());
  useEffect(() => {
    reload();
    const reset = () => {
      reload();
      setSelectedId(null);
      setRefundOpen(false);
      setQuery("");
    };
    window.addEventListener("operations:changed", reload);
    window.addEventListener("tenant:changed", reset);
    window.addEventListener("branch:changed", reset);
    return () => {
      window.removeEventListener("operations:changed", reload);
      window.removeEventListener("tenant:changed", reset);
      window.removeEventListener("branch:changed", reset);
    };
  }, []);
  const details = selectedId
    ? financeService.getPaymentDetails(selectedId)
    : undefined;
  const orders = new Map(
    payments.map((payment) => [
      payment.id,
      financeService.getPaymentDetails(payment.id)?.order,
    ]),
  );
  const branches = new Map(
    branchService
      .getBranches(tenant.id)
      .map((branch) => [branch.id, branch.name]),
  );
  const employees = new Map(
    employeeService
      .getEmployees(tenant.id)
      .map((employee) => [employee.id, employee.name]),
  );
  const customers = new Map(
    customerService
      .getCustomers()
      .map((customer) => [customer.id, customer.name]),
  );
  const filtered = payments.filter((payment) => {
    const order = orders.get(payment.id);
    const haystack =
      `${payment.transactionNumber ?? payment.id} ${order?.orderNumber ?? ""} ${order?.customerName ?? customers.get(payment.customerId ?? "") ?? ""}`.toLowerCase();
    return (
      (!query || haystack.includes(query.toLowerCase())) &&
      (method === "ALL" || payment.method === method) &&
      (status === "ALL" || payment.status === status) &&
      (!date || payment.createdAt.slice(0, 10) === date)
    );
  });
  const pagination = usePagination(filtered, `${query}:${method}:${status}:${date}`);
  function processRefund() {
    if (!details) return;
    try {
      financeService.processRefund(
        details.payment.id,
        Number(refundAmount),
        refundReason,
      );
      setConfirmRefund(false);
      setRefundOpen(false);
      setRefundAmount("");
      setRefundReason("");
      reload();
      toast.success("تم تسجيل الاسترجاع وتحديث حالة الدفع.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "تعذر تنفيذ الاسترجاع.",
      );
    }
  }
  return (
    <AdminShell>
      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5"
      >
        <div className="mb-4">
          <p className="text-xs font-bold text-accent">المالية</p>
          <h1 className="mt-1 text-2xl font-black">المدفوعات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            مدفوعات الفرع الحالي مع تفاصيل العمليات والاسترجاعات المرتبطة.
          </p>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="grid gap-2 border-b p-4 sm:grid-cols-2 lg:grid-cols-5">
              <SearchInput placeholder="رقم العملية أو الطلب أو العميل" value={query} onChange={setQuery} />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <select
                className="h-10 rounded-md border bg-background px-3"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="ALL">كل طرق الدفع</option>
                {Object.entries(methods).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                className="h-10 rounded-md border bg-background px-3"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ALL">كل الحالات</option>
                {[
                  "PENDING",
                  "PAID",
                  "FAILED",
                  "PARTIALLY_REFUNDED",
                  "REFUNDED",
                ].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setDate("");
                  setMethod("ALL");
                  setStatus("ALL");
                }}
              >
                مسح الفلاتر
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-right text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {[
                      "رقم العملية",
                      "رقم الطلب",
                      "العميل",
                      "الفرع",
                      "المبلغ",
                      "طريقة الدفع",
                      "الحالة",
                      "الموظف",
                      "التاريخ",
                      "الإجراءات",
                    ].map((heading) => (
                      <th key={heading} className="px-4 py-3">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagination.items.map((payment) => {
                    const order = orders.get(payment.id);
                    return (
                      <tr key={payment.id} className="border-t">
                        <td className="px-4 py-3 font-bold">
                          {payment.transactionNumber ?? payment.id}
                        </td>
                        <td className="px-4 py-3">
                          {order?.orderNumber ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          {order?.customerName ??
                            customers.get(payment.customerId ?? "") ??
                            "عميل نقدي"}
                        </td>
                        <td className="px-4 py-3">
                          {branches.get(payment.branchId ?? "") ??
                            "الفرع الحالي"}
                        </td>
                        <td className="px-4 py-3 font-bold">
                          {formatMoney(
                            payment.amount,
                            tenant.settings.currencySymbol,
                          )}
                        </td>
                        <td className="px-4 py-3">{methods[payment.method]}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={payment.status} />
                        </td>
                        <td className="px-4 py-3">
                          {employees.get(payment.employeeId ?? "") ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          {formatDateTime(payment.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedId(payment.id)}
                          >
                            <Eye className="ml-1 h-4 w-4" />
                            عرض
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!filtered.length ? (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  لا توجد مدفوعات حتى الآن.
                </div>
              ) : null}
              <Pagination {...pagination.state} onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
            </div>
          </CardContent>
        </Card>
        <Dialog
          open={Boolean(selectedId)}
          onOpenChange={(open) => !open && setSelectedId(null)}
        >
          <DialogContent dir="rtl" className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل عملية الدفع</DialogTitle>
              <DialogDescription>
                {details?.payment.transactionNumber ?? details?.payment.id}
              </DialogDescription>
            </DialogHeader>
            {details ? (
              <div className="space-y-4">
                <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
                  <Info
                    label="الطلب"
                    value={details.order?.orderNumber ?? "—"}
                  />
                  <Info
                    label="المبلغ"
                    value={formatMoney(
                      details.payment.amount,
                      tenant.settings.currencySymbol,
                    )}
                  />
                  <Info
                    label="طريقة الدفع"
                    value={methods[details.payment.method]}
                  />
                  <Info
                    label="الفرع"
                    value={
                      branches.get(details.payment.branchId ?? "") ??
                      "الفرع الحالي"
                    }
                  />
                  <Info
                    label="الموظف"
                    value={
                      employees.get(details.payment.employeeId ?? "") ?? "—"
                    }
                  />
                  <Info
                    label="مرجع العملية"
                    value={details.payment.transactionReference ?? "غير متاح"}
                  />
                  <Info
                    label="المسترجع"
                    value={formatMoney(
                      details.totalRefunded,
                      tenant.settings.currencySymbol,
                    )}
                  />
                  <Info
                    label="المتاح للاسترجاع"
                    value={formatMoney(
                      details.remainingRefundable,
                      tenant.settings.currencySymbol,
                    )}
                  />
                </div>
                {details.payment.allocations?.length ? (
                  <div>
                    <b>تفاصيل الدفع المختلط</b>
                    {details.payment.allocations.map((part) => (
                      <div
                        key={part.method}
                        className="mt-2 flex justify-between rounded border p-2"
                      >
                        <span>{methods[part.method]}</span>
                        <b>
                          {formatMoney(
                            part.amount,
                            tenant.settings.currencySymbol,
                          )}
                        </b>
                      </div>
                    ))}
                  </div>
                ) : null}
                {details.refunds.length ? (
                  <div>
                    <b>عمليات الاسترجاع</b>
                    {details.refunds.map((refund) => (
                      <div
                        key={refund.id}
                        className="mt-2 flex justify-between rounded border p-2 text-sm"
                      >
                        <span>{refund.reason}</span>
                        <b>
                          {formatMoney(
                            refund.amount,
                            tenant.settings.currencySymbol,
                          )}
                        </b>
                      </div>
                    ))}
                  </div>
                ) : null}
                {access.hasPermission("refunds.create") &&
                details.remainingRefundable > 0 ? (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setRefundAmount(String(details.remainingRefundable));
                      setRefundOpen(true);
                    }}
                  >
                    <RotateCcw className="ml-2 h-4 w-4" />
                    إنشاء استرجاع
                  </Button>
                ) : null}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
        <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء استرجاع</DialogTitle>
              <DialogDescription>
                لن يؤدي إلغاء الطلب وحده إلى استرجاع مالي؛ هذه العملية مستقلة.
              </DialogDescription>
            </DialogHeader>
            <label className="text-sm font-bold">
              المبلغ
              <Input
                type="number"
                min="0.01"
                max={details?.remainingRefundable}
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
            </label>
            <label className="text-sm font-bold">
              السبب
              <Input
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </label>
            <Button
              variant="destructive"
              onClick={() => setConfirmRefund(true)}
            >
              مراجعة الاسترجاع
            </Button>
          </DialogContent>
        </Dialog>
        <ConfirmDialog
          open={confirmRefund}
          onOpenChange={setConfirmRefund}
          title="تأكيد الاسترجاع المالي؟"
          description={`سيتم استرجاع ${refundAmount || 0} ${tenant.settings.currencySymbol} وتحديث حالة الدفع.`}
          confirmLabel="تأكيد الاسترجاع"
          onConfirm={processRefund}
        />
      </section>
    </AdminShell>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}
