"use client";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import { useTenant } from "@/providers/tenant-provider";
import { financeService } from "@/services/finance.service";
import type { RefundRecord } from "@/types/cafe-operations.types";
export default function RefundsPage() {
  const { tenant } = useTenant();
  const [records, setRecords] = useState<RefundRecord[]>([]);
  const reload = () => setRecords(financeService.getRefunds());
  useEffect(() => {
    reload();
    window.addEventListener("operations:changed", reload);
    return () => window.removeEventListener("operations:changed", reload);
  }, []);
  return (
    <AdminShell>
      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5"
      >
        <p className="text-xs font-bold text-accent">المالية</p>
        <h1 className="mt-1 text-2xl font-black">الاسترجاعات</h1>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          سجل الاسترجاعات الكامل للفرع الحالي. إنشاء الاسترجاع متاح من تفاصيل
          عملية الدفع.
        </p>
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[800px] text-right text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {[
                    "الطلب",
                    "عملية الدفع",
                    "النوع",
                    "المبلغ",
                    "السبب",
                    "الموظف",
                    "التاريخ",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-t">
                    <td className="px-4 py-3">
                      {financeService.getPaymentDetails(record.paymentId)?.order
                        ?.orderNumber ?? record.orderId}
                    </td>
                    <td className="px-4 py-3">
                      {financeService.getPaymentDetails(record.paymentId)
                        ?.payment.transactionNumber ?? record.paymentId}
                    </td>
                    <td className="px-4 py-3">
                      {record.type === "FULL" ? "كامل" : "جزئي"}
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {formatMoney(
                        record.amount,
                        tenant.settings.currencySymbol,
                      )}
                    </td>
                    <td className="px-4 py-3">{record.reason}</td>
                    <td className="px-4 py-3">{record.employeeId ?? "—"}</td>
                    <td className="px-4 py-3">
                      {new Date(record.createdAt).toLocaleString("ar-EG")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!records.length ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                لا توجد عمليات استرجاع.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
