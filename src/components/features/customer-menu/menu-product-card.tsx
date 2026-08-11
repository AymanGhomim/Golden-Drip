import Image from "next/image";
import { Minus, Plus, ShoppingBag, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "@/components/shared/price";
import { cn } from "@/lib/utils";
import {
  translatedCategoryName,
  translatedProduct,
  type Locale,
} from "@/lib/menu-translations";
import type { Product } from "@/types/product.types";

export function MenuProductCard({
  product,
  index,
  locale,
  quantity,
  imageLoaded,
  addLabel,
  onOpen,
  onImageLoaded,
  onAdd,
  onIncrease,
  onDecrease,
}: {
  product: Product;
  index: number;
  locale: Locale;
  quantity: number;
  imageLoaded: boolean;
  addLabel: string;
  onOpen: () => void;
  onImageLoaded: () => void;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  const translated = translatedProduct(product.id, locale);
  return (
    <Card
      className="menu-card group cursor-pointer overflow-hidden rounded-md border border-border/70 bg-card shadow-[0_10px_28px_hsl(var(--foreground)/0.07)] transition-[border-color,box-shadow,transform] duration-200 ease-out hover:scale-[1.006] hover:-translate-y-0.5 hover:border-accent/45 hover:shadow-[0_16px_36px_hsl(var(--foreground)/0.1)] active:scale-[0.998] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onOpen();
      }}
    >
      <div className="relative aspect-[1.35/1] overflow-hidden bg-muted sm:aspect-[1.55/1]">
        {product.image ? (
          <>
            {!imageLoaded ? (
              <Skeleton className="absolute inset-0 z-0 rounded-none" />
            ) : null}
            <Image
              src={product.image}
              alt={translated.name}
              fill
              sizes="(min-width: 1024px) 33vw, 50vw"
              className={cn(
                "object-cover transition-[opacity,transform] duration-200 ease-out group-hover:scale-[1.02]",
                imageLoaded ? "opacity-100" : "opacity-0",
              )}
              onLoad={onImageLoaded}
              priority={index < 2}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/22 via-55% to-black/8 transition-colors duration-200 group-hover:from-black/68 group-hover:via-black/18" />
        <div className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="absolute inset-0 bg-accent/8" />
        </div>
        <Price
          value={product.price}
          locale={locale}
          className="absolute right-4 top-4 rounded-full border border-white/35 bg-white/18 px-3 py-2 text-sm font-black text-white shadow-[0_8px_18px_rgba(0,0,0,0.16)] backdrop-blur-md sm:text-lg"
          currencyClassName="text-white/75"
        />
        {quantity > 0 ? (
          <Badge className="absolute left-4 top-4 gap-2 rounded-full border border-white/25 bg-accent px-2 py-2 text-[0.68rem] font-bold text-accent-foreground shadow-sm">
            <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {quantity}
          </Badge>
        ) : null}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="mb-1 hidden w-fit rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[0.65rem] font-semibold text-white/90 backdrop-blur-sm sm:block">
            {translatedCategoryName(product.categoryId, locale)}
          </p>
          <h2 className="line-clamp-2 text-lg font-black leading-snug text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:text-2xl">
            {translated.name}
          </h2>
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col gap-4 border-t bg-gradient-to-b from-card to-muted/25 p-4 transition-colors duration-200 group-hover:from-card group-hover:to-accent/8 sm:p-6">
        <p className="min-h-10 line-clamp-2 text-xs leading-5 text-muted-foreground sm:min-h-12 sm:text-sm sm:leading-6">
          {translated.description}
        </p>
        <div className="mt-auto pt-2">
          {quantity > 0 ? (
            <div
              className="flex h-9 items-center justify-between overflow-hidden rounded-md border border-accent/30 bg-accent/8 shadow-inner transition-colors duration-200 group-hover:border-accent/45 group-hover:bg-accent/12 sm:h-11"
              onClick={(event) => event.stopPropagation()}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-none transition-all duration-200 hover:bg-accent/18 hover:text-foreground active:scale-[0.96] sm:h-11 sm:w-12"
                onClick={onDecrease}
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <span className="min-w-8 text-center text-sm font-bold sm:min-w-12 sm:text-base">
                {quantity}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-none transition-all duration-200 hover:bg-accent/18 hover:text-foreground active:scale-[0.96] sm:h-11 sm:w-12"
                onClick={onIncrease}
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              className="h-12 w-full gap-2 rounded-lg border border-primary/10 bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[0_8px_18px_hsl(var(--foreground)/0.12)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 hover:text-primary-foreground hover:shadow-[0_12px_24px_hsl(var(--foreground)/0.18)] active:translate-y-0 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2"
              onClick={(event) => {
                event.stopPropagation();
                onAdd();
              }}
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {addLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
