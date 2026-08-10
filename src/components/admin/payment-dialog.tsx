"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, CreditCard, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatMoney, roundMoney } from "@/lib/money";
import type { PaymentMethod } from "@/types/order.types";
import type { PaymentRecord } from "@/types/cafe-operations.types";

export type PaymentConfirmation = {
  method: PaymentMethod;
  allocations?: PaymentRecord["allocations"];
  receivedAmount?: number;
};

export function PaymentDialog({
  open,
  total,
  currencySymbol,
  busy = false,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  total: number;
  currencySymbol?: string;
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payment: PaymentConfirmation) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [received, setReceived] = useState("");
  const [cashPart, setCashPart] = useState("");
  useEffect(() => {
    if (open) {
      setMethod("CASH");
      setReceived(String(total));
      setCashPart("");
    }
  }, [open, total]);
  const receivedValue = Number(received);
  const cashValue = Number(cashPart);
  const change = Math.max(
    0,
    (Number.isFinite(receivedValue) ? receivedValue : 0) - total,
  );
  const mixedRemaining = Math.max(
    0,
    total - (Number.isFinite(cashValue) ? cashValue : 0),
  );
  const methods = [
    ["CASH", "نقدي", Banknote],
    ["CARD", "بطاقة", CreditCard],
    ["WALLET", "محفظة", WalletCards],
    ["ONLINE", "دفع إلكتروني", CreditCard],
    ["MIXED", "دفع مختلط", WalletCards],
  ] as const;
  const canConfirm =
    total >= 0 &&
    (method === "CASH"
      ? Number.isFinite(receivedValue) && receivedValue >= total
      : method === "MIXED"
        ? Number.isFinite(cashValue) && cashValue > 0 && cashValue < total
        : true);
  const paymentHint = useMemo(
    () =>
      method === "CASH"
        ? `الباقي للعميل: ${formatMoney(change, currencySymbol)}`
        : method === "MIXED"
          ? `المتبقي بالبطاقة: ${formatMoney(mixedRemaining, currencySymbol)}`
          : "سيتم تسجيل المبلغ كاملًا على طريقة الدفع المختارة",
    [change, currencySymbol, method, mixedRemaining],
  );
  function submit() {
    if (!canConfirm || busy) return;
    if (method === "MIXED")
      return onConfirm({
        method,
        allocations: [
          { method: "CASH", amount: roundMoney(cashValue) },
          { method: "CARD", amount: roundMoney(mixedRemaining) },
        ],
      });
    onConfirm({
      method,
      receivedAmount: method === "CASH" ? receivedValue : undefined,
    });
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle>الدفع</DialogTitle>
          <DialogDescription>
            راجع المبلغ واختر طريقة الدفع قبل تأكيد العملية.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl bg-primary p-4 text-center text-primary-foreground">
            <p className="text-sm opacity-80">الإجمالي المطلوب</p>
            <p className="mt-1 text-3xl font-black">
              {formatMoney(total, currencySymbol)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {methods.map(([value, label, Icon]) => (
              <button
                type="button"
                key={value}
                onClick={() => setMethod(value)}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-bold ${method === value ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
          {method === "CASH" ? (
            <div className="space-y-2">
              <label htmlFor="received" className="text-sm font-semibold">
                المبلغ المستلم
              </label>
              <Input
                id="received"
                value={received}
                onChange={(event) => setReceived(event.target.value)}
                type="number"
                min="0"
                step="0.01"
                className="h-11 rounded-lg text-lg"
              />
              <p
                className={`text-sm font-bold ${change > 0 ? "text-emerald-700" : "text-muted-foreground"}`}
              >
                {paymentHint}
              </p>
            </div>
          ) : null}
          {method === "MIXED" ? (
            <div className="space-y-3">
              <label htmlFor="cash-part" className="text-sm font-semibold">
                المبلغ النقدي
                <Input
                  id="cash-part"
                  value={cashPart}
                  onChange={(event) => setCashPart(event.target.value)}
                  type="number"
                  min="0"
                  max={total}
                  step="0.01"
                  className="mt-1 h-11 rounded-lg"
                />
              </label>
              <div className="rounded-lg bg-muted p-3 text-sm font-semibold">
                {paymentHint}
              </div>
            </div>
          ) : null}
          <Button
            type="button"
            disabled={!canConfirm || busy}
            className="h-11 w-full rounded-lg"
            onClick={submit}
          >
            {busy ? "جارٍ تسجيل الدفع..." : "تأكيد الدفع"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
