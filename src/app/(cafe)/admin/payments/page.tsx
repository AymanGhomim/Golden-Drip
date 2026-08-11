"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { PaymentDialogs } from "@/components/features/payments/payment-dialogs";
import { PaymentsFilters } from "@/components/features/payments/payments-filters";
import { PaymentsTable } from "@/components/features/payments/payments-table";
import { Card, CardContent } from "@/components/ui/card";
import { usePaymentsPage } from "@/hooks/use-payments-page";

export default function PaymentsPage() {
  const controller = usePaymentsPage();
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
            <PaymentsFilters
              query={controller.query}
              date={controller.date}
              method={controller.method}
              status={controller.status}
              onQueryChange={controller.setQuery}
              onDateChange={controller.setDate}
              onMethodChange={controller.setMethod}
              onStatusChange={controller.setStatus}
              onClear={controller.clearFilters}
            />
            <PaymentsTable
              payments={controller.pagination.items}
              orders={controller.orders}
              branches={controller.branches}
              employees={controller.employees}
              customers={controller.customers}
              currency={controller.tenant.settings.currencySymbol}
              pagination={controller.pagination}
              onView={controller.setSelectedId}
            />
          </CardContent>
        </Card>
        <PaymentDialogs
          details={controller.details}
          branches={controller.branches}
          employees={controller.employees}
          currency={controller.tenant.settings.currencySymbol}
          canRefund={controller.access.hasPermission("refunds.create")}
          refundOpen={controller.refundOpen}
          confirmRefund={controller.confirmRefund}
          refundAmount={controller.refundAmount}
          refundReason={controller.refundReason}
          onDetailsClose={() => controller.setSelectedId(null)}
          onOpenRefund={controller.openRefund}
          onRefundOpenChange={controller.setRefundOpen}
          onConfirmOpenChange={controller.setConfirmRefund}
          onAmountChange={controller.setRefundAmount}
          onReasonChange={controller.setRefundReason}
          onProcessRefund={controller.processRefund}
        />
      </section>
    </AdminShell>
  );
}
