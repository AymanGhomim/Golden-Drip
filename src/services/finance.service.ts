import { roundMoney } from "@/lib/money";
import { cafeDataService } from "@/services/cafe-data.service";
import { cafeOperationsService } from "@/services/cafe-operations.service";
import { useAuthStore } from "@/store/auth.store";
import type {
  CashRegisterEntry,
  Expense,
  PaymentRecord,
  RefundRecord,
  Shift,
  NotificationRecord,
} from "@/types/cafe-operations.types";

const actorId = () =>
  useAuthStore.getState().user?.employeeId ?? useAuthStore.getState().user?.id;
const changed = () => {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("operations:changed"));
};

export function calculateRefundState(
  payment: PaymentRecord,
  refunds: RefundRecord[],
) {
  const totalRefunded = roundMoney(
    refunds
      .filter((item) => item.paymentId === payment.id)
      .reduce((sum, item) => sum + Number(item.amount), 0),
  );
  const remainingRefundable = roundMoney(
    Math.max(0, payment.amount - totalRefunded),
  );
  const status: PaymentRecord["status"] =
    totalRefunded <= 0
      ? payment.status === "PENDING" || payment.status === "FAILED"
        ? payment.status
        : "PAID"
      : remainingRefundable > 0
        ? "PARTIALLY_REFUNDED"
        : "REFUNDED";
  return { totalRefunded, remainingRefundable, status };
}

export const financeService = {
  getExpenses: () => cafeOperationsService.get<Expense>("expenses"),
  getPayments: () => cafeOperationsService.get<PaymentRecord>("payments"),
  getRefunds: () => cafeOperationsService.get<RefundRecord>("refunds"),
  getPaymentDetails(paymentId: string) {
    const payment = this.getPayments().find((item) => item.id === paymentId);
    if (!payment) return undefined;
    const refunds = this.getRefunds().filter(
      (item) => item.paymentId === paymentId,
    );
    return {
      payment,
      order: cafeDataService
        .getOrders()
        .find((item) => item.id === payment.orderId),
      refunds,
      ...calculateRefundState(payment, refunds),
    };
  },
  createCashMovement(value: {
    type: CashRegisterEntry["type"];
    amount: number;
    reason?: string;
    orderId?: string;
    paymentId?: string;
    refundId?: string;
    expenseId?: string;
    shiftId?: string;
  }) {
    if (!Number.isFinite(value.amount) || value.amount <= 0)
      throw new Error("المبلغ يجب أن يكون أكبر من صفر.");
    const entry = cafeOperationsService.create<CashRegisterEntry>(
      "cashRegister",
      {
        ...value,
        employeeId: actorId(),
        createdAt: new Date().toISOString(),
      },
    );
    cafeOperationsService.audit({
      module: "cashRegister",
      action: value.type,
      description: `${value.type === "CASH_IN" ? "إيداع نقدي" : value.type === "CASH_OUT" ? "سحب نقدي" : "حركة خزنة"} بقيمة ${value.amount}`,
      entityType: "cashRegister",
      entityId: entry.id,
    });
    changed();
    return entry;
  },
  processRefund(paymentId: string, amount: number, reason: string) {
    const details = this.getPaymentDetails(paymentId);
    if (!details) throw new Error("عملية الدفع غير موجودة في الفرع الحالي.");
    if (!details.order) throw new Error("الطلب المرتبط بعملية الدفع غير متاح.");
    if (!reason.trim()) throw new Error("سبب الاسترجاع مطلوب.");
    if (!Number.isFinite(amount) || amount <= 0)
      throw new Error("قيمة الاسترجاع يجب أن تكون أكبر من صفر.");
    if (amount > details.remainingRefundable)
      throw new Error("قيمة الاسترجاع أكبر من الرصيد المتاح للاسترجاع.");
    const refund = cafeOperationsService.create<RefundRecord>("refunds", {
      orderId: details.payment.orderId,
      paymentId,
      amount: roundMoney(amount),
      type: amount === details.remainingRefundable ? "FULL" : "PARTIAL",
      reason: reason.trim(),
      employeeId: actorId(),
      createdAt: new Date().toISOString(),
    });
    const allRefunds = [...this.getRefunds()];
    const next = calculateRefundState(details.payment, allRefunds);
    cafeOperationsService.save(
      "payments",
      this.getPayments().map((item) =>
        item.id === paymentId ? { ...item, status: next.status } : item,
      ),
    );
    const cashRatio =
      details.payment.method === "CASH"
        ? 1
        : details.payment.method === "MIXED"
          ? Math.min(
              1,
              (details.payment.allocations
                ?.filter((item) => item.method === "CASH")
                .reduce((sum, item) => sum + item.amount, 0) ?? 0) /
                details.payment.amount,
            )
          : 0;
    const cashAmount = roundMoney(amount * cashRatio);
    if (cashAmount > 0)
      this.createCashMovement({
        type: "REFUND",
        amount: cashAmount,
        reason: reason.trim(),
        orderId: details.order.id,
        paymentId,
        refundId: refund.id,
      });
    const orders = cafeDataService.getOrders();
    cafeDataService.saveOrders(
      orders.map((order) =>
        order.id === details.order?.id
          ? {
              ...order,
              paymentStatus:
                next.status === "REFUNDED" ? "REFUNDED" : "PARTIALLY_REFUNDED",
            }
          : order,
      ),
    );
    cafeOperationsService.audit({
      module: "refunds",
      action: "REFUND_CREATED",
      description: `تم استرجاع ${amount} من الطلب ${details.order.orderNumber}`,
      entityType: "refund",
      entityId: refund.id,
    });
    cafeOperationsService.create<NotificationRecord>("notifications", {
      type: "REFUND",
      title: "تم تنفيذ استرجاع مالي",
      message: `الطلب ${details.order.orderNumber} · ${amount}`,
      read: false,
      relatedEntityType: "payment",
      relatedEntityId: paymentId,
      createdAt: new Date().toISOString(),
    });
    changed();
    return { refund, ...next };
  },
  getCashSummary() {
    const entries =
      cafeOperationsService.get<CashRegisterEntry>("cashRegister");
    const sum = (type: CashRegisterEntry["type"]) =>
      roundMoney(
        entries
          .filter((item) => item.type === type)
          .reduce((total, item) => total + item.amount, 0),
      );
    const openingBalance = sum("OPENING_BALANCE");
    const cashSales = sum("CASH_SALE");
    const cashIn = sum("CASH_IN");
    const cashOut = sum("CASH_OUT");
    const expenses = sum("EXPENSE");
    const refunds = sum("REFUND");
    const adjustments = entries
      .filter((item) => item.type === "SHIFT_ADJUSTMENT")
      .reduce((total, item) => total + item.amount, 0);
    const expectedBalance = roundMoney(
      openingBalance +
        cashSales +
        cashIn -
        cashOut -
        expenses -
        refunds +
        adjustments,
    );
    return {
      entries,
      openingBalance,
      cashSales,
      cashIn,
      cashOut,
      expenses,
      refunds,
      expectedBalance,
      currentBalance: expectedBalance,
    };
  },
  createExpense(value: {
    category: string;
    amount: number;
    date: string;
    notes?: string;
    paymentMethod?: Expense["paymentMethod"];
    attachment?: Expense["attachment"];
  }) {
    if (!value.category.trim()) throw new Error("تصنيف المصروف مطلوب.");
    if (!Number.isFinite(value.amount) || value.amount <= 0)
      throw new Error("قيمة المصروف يجب أن تكون أكبر من صفر.");
    const expense = cafeOperationsService.create<Expense>("expenses", {
      ...value,
      category: value.category.trim(),
      employeeId: actorId(),
      createdAt: new Date().toISOString(),
    });
    if (value.paymentMethod === "CASH")
      this.createCashMovement({
        type: "EXPENSE",
        amount: value.amount,
        reason: value.notes || value.category,
        expenseId: expense.id,
      });
    cafeOperationsService.audit({
      module: "expenses",
      action: "EXPENSE_CREATED",
      description: `تم تسجيل مصروف ${expense.category} بقيمة ${expense.amount}`,
      entityType: "expense",
      entityId: expense.id,
    });
    changed();
    return expense;
  },
  updateExpense(
    expenseId: string,
    value: {
      category: string;
      amount: number;
      date: string;
      notes?: string;
      paymentMethod?: Expense["paymentMethod"];
      attachment?: Expense["attachment"];
    },
  ) {
    const expenses = cafeOperationsService.get<Expense>("expenses");
    const current = expenses.find((item) => item.id === expenseId);
    if (!current) throw new Error("المصروف غير موجود في الفرع الحالي.");
    if (
      !value.category.trim() ||
      !Number.isFinite(value.amount) ||
      value.amount <= 0
    )
      throw new Error("راجع تصنيف المصروف وقيمته.");
    const updated: Expense = {
      ...current,
      ...value,
      category: value.category.trim(),
    };
    cafeOperationsService.save(
      "expenses",
      expenses.map((item) => (item.id === expenseId ? updated : item)),
    );
    const cashEntries =
      cafeOperationsService.get<CashRegisterEntry>("cashRegister");
    const linked = cashEntries.find((item) => item.expenseId === expenseId);
    if (value.paymentMethod === "CASH") {
      if (linked)
        cafeOperationsService.save(
          "cashRegister",
          cashEntries.map((item) =>
            item.id === linked.id
              ? {
                  ...item,
                  amount: value.amount,
                  reason: value.notes || value.category,
                }
              : item,
          ),
        );
      else
        this.createCashMovement({
          type: "EXPENSE",
          amount: value.amount,
          reason: value.notes || value.category,
          expenseId,
        });
    } else if (linked)
      cafeOperationsService.save(
        "cashRegister",
        cashEntries.filter((item) => item.id !== linked.id),
      );
    cafeOperationsService.audit({
      module: "expenses",
      action: "EXPENSE_UPDATED",
      description: `تم تحديث المصروف ${updated.category}`,
      entityType: "expense",
      entityId: expenseId,
    });
    changed();
    return updated;
  },
  removeExpense(expenseId: string) {
    const expenses = cafeOperationsService.get<Expense>("expenses");
    const expense = expenses.find((item) => item.id === expenseId);
    if (!expense) throw new Error("المصروف غير موجود في الفرع الحالي.");
    cafeOperationsService.save(
      "expenses",
      expenses.filter((item) => item.id !== expenseId),
    );
    cafeOperationsService.save(
      "cashRegister",
      cafeOperationsService
        .get<CashRegisterEntry>("cashRegister")
        .filter((item) => item.expenseId !== expenseId),
    );
    cafeOperationsService.audit({
      module: "expenses",
      action: "EXPENSE_DELETED",
      description: `تم حذف المصروف ${expense.category}`,
      entityType: "expense",
      entityId: expenseId,
    });
    changed();
  },
  openShift(employeeId: string, openingCash: number) {
    if (!employeeId) throw new Error("الموظف مطلوب.");
    if (!Number.isFinite(openingCash) || openingCash < 0)
      throw new Error("الرصيد الافتتاحي غير صحيح.");
    const shifts = cafeOperationsService.get<Shift>("shifts");
    if (
      shifts.some(
        (item) => item.employeeId === employeeId && item.status === "OPEN",
      )
    )
      throw new Error("يوجد وردية مفتوحة بالفعل لهذا الموظف في الفرع.");
    const shift = cafeOperationsService.create<Shift>("shifts", {
      employeeId,
      openingCash,
      openedAt: new Date().toISOString(),
      status: "OPEN",
    });
    if (openingCash > 0)
      cafeOperationsService.create<CashRegisterEntry>("cashRegister", {
        type: "OPENING_BALANCE",
        amount: openingCash,
        shiftId: shift.id,
        employeeId,
        createdAt: shift.openedAt,
      });
    cafeOperationsService.audit({
      module: "shifts",
      action: "SHIFT_OPENED",
      description: `تم فتح وردية برصيد ${openingCash}`,
      entityType: "shift",
      entityId: shift.id,
    });
    changed();
    return shift;
  },
  closeShift(shiftId: string, actualCash: number) {
    if (!Number.isFinite(actualCash) || actualCash < 0)
      throw new Error("الرصيد الفعلي غير صحيح.");
    const shifts = cafeOperationsService.get<Shift>("shifts");
    const shift = shifts.find((item) => item.id === shiftId);
    if (!shift) throw new Error("الوردية غير موجودة في الفرع الحالي.");
    if (shift.status === "CLOSED")
      throw new Error("تم إغلاق هذه الوردية من قبل.");
    const entries = cafeOperationsService
      .get<CashRegisterEntry>("cashRegister")
      .filter((item) => item.createdAt >= shift.openedAt);
    const value = (types: CashRegisterEntry["type"][]) =>
      entries
        .filter((item) => types.includes(item.type))
        .reduce((sum, item) => sum + item.amount, 0);
    const expectedCash = roundMoney(
      shift.openingCash +
        value(["CASH_SALE", "CASH_IN"]) -
        value(["CASH_OUT", "EXPENSE", "REFUND"]),
    );
    const difference = roundMoney(actualCash - expectedCash);
    const closedAt = new Date().toISOString();
    const updated = {
      ...shift,
      status: "CLOSED" as const,
      closedAt,
      expectedCash,
      actualCash,
      difference,
    };
    cafeOperationsService.save(
      "shifts",
      shifts.map((item) => (item.id === shiftId ? updated : item)),
    );
    cafeOperationsService.audit({
      module: "shifts",
      action: "SHIFT_CLOSED",
      description: `تم إغلاق الوردية بفارق ${difference}`,
      entityType: "shift",
      entityId: shift.id,
    });
    changed();
    return updated;
  },
};
