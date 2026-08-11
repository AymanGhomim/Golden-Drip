import { Input } from "@/components/ui/input";
import { orderStatusPresentation } from "@shared/presentation/order";
import type { Order } from "@/types/order.types";

const tabs: Array<[string, string]> = [
  ["ALL", "الكل"],
  ...Object.entries(orderStatusPresentation).map(
    ([value, item]) => [value, item.label] as [string, string],
  ),
];

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

export type OrdersFiltersProps = {
  orders: Order[];
  query: string;
  status: string;
  type: string;
  source: string;
  payment: string;
  method: string;
  employee: string;
  dateFrom: string;
  dateTo: string;
  setQuery: (value: string) => void;
  setStatus: (value: string) => void;
  setType: (value: string) => void;
  setSource: (value: string) => void;
  setPayment: (value: string) => void;
  setMethod: (value: string) => void;
  setEmployee: (value: string) => void;
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
};

export function OrdersFilters(props: OrdersFiltersProps) {
  return (
    <>
      <div className="scrollbar-hidden flex gap-1 overflow-x-auto border-b p-3">
        {tabs.map(([value, label]) => (
          <button
            type="button"
            key={value}
            onClick={() => props.setStatus(value)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${props.status === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            {label}
            <span className="mr-1 opacity-70">
              (
              {value === "ALL"
                ? props.orders.length
                : props.orders.filter((order) => order.status === value).length}
              )
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 border-b p-4">
        <Input
          value={props.query}
          onChange={(event) => props.setQuery(event.target.value)}
          placeholder="ابحث برقم الطلب أو العميل أو الهاتف أو الطاولة"
          className="h-11 rounded-lg"
        />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            label="نوع الطلب"
            value={props.type}
            onChange={props.setType}
            options={[
              ["ALL", "كل الأنواع"],
              ["TABLE", "داخل الكافيه"],
              ["TAKEAWAY", "تيك أواي"],
              ["DELIVERY", "توصيل"],
            ]}
          />
          <FilterSelect
            label="مصدر الطلب"
            value={props.source}
            onChange={props.setSource}
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
            value={props.payment}
            onChange={props.setPayment}
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
              value={props.dateFrom}
              onChange={(event) => props.setDateFrom(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-muted-foreground">
              إلى تاريخ
            </label>
            <Input
              type="date"
              className="h-10 rounded-lg"
              value={props.dateTo}
              onChange={(event) => props.setDateTo(event.target.value)}
            />
          </div>
          <FilterSelect
            label="طريقة الدفع"
            value={props.method}
            onChange={props.setMethod}
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
            value={props.employee}
            onChange={props.setEmployee}
            options={[
              ["ALL", "كل الموظفين"],
              ...Array.from(
                new Set(
                  props.orders.map((order) => order.createdBy).filter(Boolean),
                ),
              ).map((value) => [value!, value!]),
            ]}
          />
        </div>
      </div>
    </>
  );
}
