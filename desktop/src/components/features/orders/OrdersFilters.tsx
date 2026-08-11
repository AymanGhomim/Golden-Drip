import { Search } from "lucide-react";
import {
  orderSourceLabels,
  orderStatusPresentation,
  orderTypeLabels,
} from "@shared/presentation/order";
import { FilterButton } from "@/components/shared/PageLayout";
import { operationalOrderSequence } from "@/features/orders/order-presentation";
import type { useOrderFilters } from "@/hooks/useOrderFilters";
import type { DesktopOrderStatus } from "@/types";

type Filters = ReturnType<typeof useOrderFilters>;

export function OrdersFilters({
  orders,
  query,
  setQuery,
  setSource,
  setStatus,
  setType,
  source,
  status,
  type,
}: Pick<
  Filters,
  | "orders"
  | "query"
  | "setQuery"
  | "setSource"
  | "setStatus"
  | "setType"
  | "source"
  | "status"
  | "type"
>) {
  return (
    <>
      <div className="flex gap-1 overflow-x-auto border-b border-[var(--brand-border)] p-3">
        {["ALL", ...operationalOrderSequence, "CANCELLED", "REFUNDED"].map(
          (value) => (
            <FilterButton
              key={value}
              active={status === value}
              onClick={() => setStatus(value)}
            >
              {value === "ALL"
                ? "الكل"
                : orderStatusPresentation[value as DesktopOrderStatus]
                    .label}{" "}
              (
              {value === "ALL"
                ? orders.length
                : orders.filter((order) => order.status === value).length}
              )
            </FilterButton>
          ),
        )}
      </div>
      <div className="grid gap-2 border-b border-[var(--brand-border)] p-4 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-muted)]" />
          <input
            className="input !mt-0 pr-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="بحث برقم الطلب أو العميل"
          />
        </div>
        <select
          className="input !mt-0"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="ALL">كل الأنواع</option>
          {Object.entries(orderTypeLabels).map(([key, label]) => (
            <option value={key} key={key}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="input !mt-0"
          value={source}
          onChange={(event) => setSource(event.target.value)}
        >
          <option value="ALL">كل المصادر</option>
          {Object.entries(orderSourceLabels).map(([key, label]) => (
            <option value={key} key={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
