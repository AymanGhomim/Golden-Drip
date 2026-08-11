import { Search } from "lucide-react";
import { PosProductCard } from "@/components/PosProductCard";
import { Empty, FilterButton, Panel } from "@/components/shared/PageLayout";
import { formatMoney } from "@/features/orders/order-presentation";
import type { usePosCheckout } from "@/hooks/usePosCheckout";

type Checkout = ReturnType<typeof usePosCheckout>;

export function PosProductBrowser({
  categories,
  category,
  changeQuantity,
  query,
  setCategory,
  setQuery,
  visibleItems,
}: Pick<
  Checkout,
  | "categories"
  | "category"
  | "changeQuantity"
  | "query"
  | "setCategory"
  | "setQuery"
  | "visibleItems"
>) {
  return (
    <Panel className="overflow-hidden p-0" title="">
      <div className="border-b border-[var(--brand-border)] p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-muted)]" />
          <input
            className="input !mt-0 pr-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="بحث عن منتج"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          <FilterButton
            active={category === "ALL"}
            onClick={() => setCategory("ALL")}
          >
            الكل
          </FilterButton>
          {categories.map((item) => (
            <FilterButton
              key={item}
              active={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </FilterButton>
          ))}
        </div>
      </div>
      <div className="grid items-stretch gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {visibleItems.map((item) => (
          <PosProductCard
            key={item.id}
            item={item}
            formattedPrice={formatMoney(item.menuItemPrice)}
            onSelect={() => changeQuantity(item.id, 1)}
          />
        ))}
      </div>
      {!visibleItems.length ? (
        <Empty>لا توجد منتجات متاحة في منيو هذا الفرع.</Empty>
      ) : null}
    </Panel>
  );
}
