import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import type { useCustomerCart } from "@/hooks/use-customer-cart";

type Cart = ReturnType<typeof useCustomerCart>;

export function CustomerCartItems({
  items,
  locale,
  text,
  unitPrice,
  decreaseQuantity,
  increaseQuantity,
  removeItem,
}: Pick<
  Cart,
  | "items"
  | "locale"
  | "text"
  | "unitPrice"
  | "decreaseQuantity"
  | "increaseQuantity"
  | "removeItem"
>) {
  return (
    <div className="overflow-hidden rounded-md border bg-card shadow-sm dark:border-white/10 dark:bg-card">
      <div className="border-b bg-muted/35 px-4 py-3 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-sm font-black">{text.items}</h2>
      </div>
      <div className="divide-y">
        {items.map((item) => {
          const itemId = item.cartId ?? item.productId;
          return (
            <div
              key={itemId}
              className="group grid grid-cols-[5.75rem_1fr] gap-3 p-3 transition-colors hover:bg-muted/25 dark:hover:bg-white/5 sm:grid-cols-[8rem_1fr] sm:gap-4 sm:p-4"
            >
              <div className="relative h-24 overflow-hidden rounded-md bg-muted shadow-sm dark:bg-white/5 sm:h-32">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="128px"
                    className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ShoppingBag className="h-7 w-7" />
                  </div>
                )}
              </div>
              <div className="min-w-0 self-center">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="line-clamp-2 text-base font-black leading-5 sm:text-lg">
                      {item.name}
                    </h2>
                    <Price
                      value={unitPrice(item)}
                      locale={locale}
                      className="mt-1 text-xs text-muted-foreground"
                    />
                  </div>
                  <Price
                    value={unitPrice(item) * item.quantity}
                    locale={locale}
                    className="shrink-0 rounded-full border bg-background px-2.5 py-1 text-xs font-black text-foreground shadow-sm dark:border-white/10 dark:bg-white/8 dark:text-foreground"
                  />
                </div>
                {item.selectedModifiers?.length ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.selectedModifiers
                      .map(
                        (modifier) =>
                          `${modifier.groupName}: ${modifier.optionName}`,
                      )
                      .join(" · ")}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex h-10 items-center overflow-hidden rounded-md border border-accent/30 bg-accent/8 shadow-inner dark:border-accent/45 dark:bg-accent/12">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-none transition-colors hover:bg-accent hover:text-accent-foreground"
                      onClick={() => decreaseQuantity(itemId)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="min-w-10 text-center text-sm font-black">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-none transition-colors hover:bg-accent hover:text-accent-foreground"
                      onClick={() => increaseQuantity(itemId)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1 px-2 text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeItem(itemId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {text.remove}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
