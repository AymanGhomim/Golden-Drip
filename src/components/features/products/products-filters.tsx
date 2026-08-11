import { Search } from "lucide-react";
import { categoryNames } from "@/components/features/products/product-model";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types/category.types";

export function ProductsFilters({
  query,
  category,
  availability,
  categories,
  onQueryChange,
  onCategoryChange,
  onAvailabilityChange,
}: {
  query: string;
  category: string;
  availability: string;
  categories: Category[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onAvailabilityChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b p-4 lg:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="بحث باسم المنتج"
          className="h-10 rounded-lg pr-9"
        />
      </div>
      <select
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
        className="h-10 rounded-lg border bg-background px-3 text-sm"
      >
        <option value="ALL">كل الأقسام</option>
        {categories.map((item) => (
          <option key={item.id} value={item.id}>
            {categoryNames[item.id]}
          </option>
        ))}
      </select>
      <select
        value={availability}
        onChange={(event) => onAvailabilityChange(event.target.value)}
        className="h-10 rounded-lg border bg-background px-3 text-sm"
      >
        <option value="ALL">كل الحالات</option>
        <option value="ONLINE">متاح أونلاين</option>
        <option value="POS">متاح POS</option>
        <option value="UNAVAILABLE">غير متاح</option>
      </select>
    </div>
  );
}
