import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Order } from "@/types/order.types";

export function OrderCancellationDialog({
  order,
  reason,
  confirmOpen,
  onOrderChange,
  onReasonChange,
  onConfirmOpenChange,
  onConfirm,
}: {
  order: Order | null;
  reason: string;
  confirmOpen: boolean;
  onOrderChange: (order: Order | null) => void;
  onReasonChange: (value: string) => void;
  onConfirmOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <Dialog
        open={Boolean(order)}
        onOpenChange={(open) => !open && onOrderChange(null)}
      >
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إلغاء الطلب {order?.orderNumber}</DialogTitle>
            <DialogDescription>
              إلغاء الطلب لا يعني استرجاع المبلغ المدفوع تلقائيًا.
            </DialogDescription>
          </DialogHeader>
          <label className="text-sm font-bold">
            سبب الإلغاء *
            <Input
              className="mt-1"
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
            />
          </label>
          <Button
            variant="destructive"
            disabled={!reason.trim()}
            onClick={() => onConfirmOpenChange(true)}
          >
            متابعة الإلغاء
          </Button>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={onConfirmOpenChange}
        title="إلغاء الطلب؟"
        description={`سيتم إلغاء الطلب بسبب: ${reason}. عملية رد المبلغ تُسجل بشكل منفصل.`}
        confirmLabel="إلغاء الطلب"
        onConfirm={onConfirm}
      />
    </>
  );
}
