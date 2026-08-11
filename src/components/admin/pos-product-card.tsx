"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useState } from "react";

import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product.types";

type PosProductCardProps = {
  product: Product;
  formattedPrice: string;
  onSelect: () => void;
};

export function PosProductCard({
  product,
  formattedPrice,
  onSelect,
}: PosProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(product.image) && !imageFailed;
  const disabled = !product.isAvailable;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-label={`${product.name}، ${formattedPrice}`}
      className={cn(
        "group flex h-full min-h-[17rem] w-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card text-right shadow-[0_8px_22px_hsl(var(--foreground)/0.06)] transition-[border-color,box-shadow,transform] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-accent/45 hover:shadow-[0_14px_30px_hsl(var(--foreground)/0.1)] active:translate-y-0 active:scale-[0.995]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2",
        disabled && "cursor-not-allowed opacity-65 hover:translate-y-0 hover:border-border/70 hover:shadow-[0_8px_22px_hsl(var(--foreground)/0.06)]",
      )}
    >
      <div className="relative aspect-[1.55/1] w-full shrink-0 overflow-hidden bg-muted">
        {hasImage ? (
          <>
            {!imageLoaded ? (
              <Skeleton className="absolute inset-0 z-0 rounded-none" />
            ) : null}
            <Image
              src={product.image!}
              alt={product.name}
              fill
              sizes="(min-width: 1536px) 230px, (min-width: 1024px) 260px, 50vw"
              className={cn(
                "object-cover transition-[opacity,transform] duration-200 ease-out group-hover:scale-[1.025]",
                imageLoaded ? "opacity-100" : "opacity-0",
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageFailed(true)}
            />
          </>
        ) : (
          <ImagePlaceholder className="h-full w-full rounded-none" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
        <span className="absolute right-3 top-3 rounded-full border border-white/35 bg-black/35 px-3 py-1.5 text-sm font-black text-white shadow-sm backdrop-blur-md">
          {formattedPrice}
        </span>
        {disabled ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[1px]">
            <span className="rounded-full bg-destructive px-3 py-1.5 text-xs font-black text-destructive-foreground shadow-sm">
              غير متاح
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col border-t bg-gradient-to-b from-card to-muted/20 p-4 transition-colors duration-200 group-hover:to-accent/8">
        <h3 className="line-clamp-2 text-base font-black leading-6 text-foreground">
          {product.name}
        </h3>
        {product.description.trim() ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {product.description}
          </p>
        ) : null}
        <span className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-bold text-primary">
          <Plus className="h-3.5 w-3.5" />
          إضافة للطلب
        </span>
      </div>
    </button>
  );
}
