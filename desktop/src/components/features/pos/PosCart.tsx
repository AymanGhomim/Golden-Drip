import { CreditCard, Minus, Plus } from "lucide-react";
import {
  orderTypeLabels,
  paymentMethodLabels,
} from "@shared/presentation/order";
import { Empty, FilterButton, Panel } from "@/components/shared/PageLayout";
import { formatMoney } from "@/features/orders/order-presentation";
import type { usePosCheckout } from "@/hooks/usePosCheckout";

type Checkout = ReturnType<typeof usePosCheckout>;
type Props = Pick<
  Checkout,
  | "changeOrderType"
  | "changeQuantity"
  | "discount"
  | "lines"
  | "orderType"
  | "paymentMethod"
  | "setDiscount"
  | "setPaymentMethod"
  | "setTableId"
  | "submit"
  | "subtotal"
  | "tableId"
  | "tables"
  | "total"
  | "updateLineNotes"
>;

export function PosCart(props: Props) {
  return (
    <Panel className="h-fit xl:sticky xl:top-24" title="الطلب الحالي">
      <div className="grid grid-cols-3 gap-2">
        {(["TABLE", "TAKEAWAY", "DELIVERY"] as const).map((type) => (
          <FilterButton
            key={type}
            active={props.orderType === type}
            onClick={() => props.changeOrderType(type)}
          >
            {orderTypeLabels[type]}
          </FilterButton>
        ))}
      </div>
      {props.orderType === "TABLE" ? (
        <label className="mt-4 block text-sm font-bold">
          الطاولة
          <select
            value={props.tableId}
            onChange={(event) => props.setTableId(event.target.value)}
            className="input"
          >
            <option value="">اختر طاولة</option>
            {props.tables
              .filter((table) => table.isActive)
              .map((table) => (
                <option key={table.id} value={table.id}>
                  طاولة {table.number}
                </option>
              ))}
          </select>
        </label>
      ) : null}
      <label className="mt-4 block text-sm font-bold">
        اختيار عميل
        <select className="input" disabled>
          <option>عميل نقدي</option>
        </select>
      </label>
      <div className="my-5 max-h-[360px] space-y-3 overflow-y-auto">
        {props.lines.map((line) => (
          <div
            key={line.id}
            className="rounded-xl border border-[var(--brand-border)] p-3"
          >
            <div className="flex justify-between gap-3">
              <b>{line.name}</b>
              <b>{formatMoney(line.menuItemPrice * line.quantity)}</b>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button
                className="round-button"
                onClick={() => props.changeQuantity(line.id, -1)}
              >
                <Minus className="h-4 w-4" />
              </button>
              <b>{line.quantity}</b>
              <button
                className="round-button"
                onClick={() => props.changeQuantity(line.id, 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <input
              className="input h-9 text-xs"
              placeholder="ملاحظات على المنتج"
              value={line.notes}
              onChange={(event) =>
                props.updateLineNotes(line.id, event.target.value)
              }
            />
          </div>
        ))}
        {!props.lines.length ? <Empty>اختر منتجات لإضافة الطلب</Empty> : null}
      </div>
      <label className="block text-sm font-bold">
        الخصم
        <input
          className="input"
          type="number"
          min="0"
          max={props.subtotal}
          value={props.discount}
          onChange={(event) =>
            props.setDiscount(Number(event.target.value) || 0)
          }
        />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {(["CASH", "CARD"] as const).map((method) => (
          <FilterButton
            key={method}
            active={props.paymentMethod === method}
            onClick={() => props.setPaymentMethod(method)}
          >
            {paymentMethodLabels[method]}
          </FilterButton>
        ))}
      </div>
      <div className="mt-5 space-y-2 border-t border-[var(--brand-border)] pt-4 text-sm">
        <div className="flex justify-between">
          <span>الإجمالي الفرعي</span>
          <span>{formatMoney(props.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>الخصم</span>
          <span>{formatMoney(props.discount)}</span>
        </div>
        <div className="flex justify-between text-lg font-black">
          <span>الإجمالي</span>
          <span>{formatMoney(props.total)}</span>
        </div>
      </div>
      <button
        disabled={
          !props.lines.length || (props.orderType === "TABLE" && !props.tableId)
        }
        onClick={props.submit}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] py-3 font-bold text-white disabled:opacity-40"
      >
        <CreditCard className="h-4 w-4" />
        تأكيد الدفع وإنشاء الطلب
      </button>
    </Panel>
  );
}
