import { Search } from "lucide-react";
import { PosProductCard } from "@/components/admin/pos-product-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/product.types";

export function PosProductBrowser({
  products,
  query,
  onQueryChange,
  onSelect,
  formatPrice,
}: {
  products: Product[];
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (product: Product) => void;
  formatPrice: (value: number) => string;
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="بحث عن منتج"
            className="pr-9"
          />
        </div>
      </CardHeader>
      <CardContent className="grid items-stretch gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {products.map((product) => (
          <PosProductCard
            key={product.id}
            product={product}
            formattedPrice={formatPrice(product.price)}
            onSelect={() => onSelect(product)}
          />
        ))}
      </CardContent>
      {!products.length ? (
        <div className="border-t p-12 text-center text-sm text-muted-foreground">
          لا توجد منتجات متاحة في منيو هذا الفرع.
        </div>
      ) : null}
    </Card>
  );
}
