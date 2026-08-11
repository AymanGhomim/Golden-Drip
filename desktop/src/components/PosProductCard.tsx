import { ImageOff, Plus } from "lucide-react";
import { useState } from "react";
import type { SellableMenuItem } from "@/types";

type PosProductCardProps = {
  item: SellableMenuItem;
  formattedPrice: string;
  onSelect: () => void;
  disabled?: boolean;
};

export function PosProductCard({
  item,
  formattedPrice,
  onSelect,
  disabled = false,
}: PosProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(item.image) && !imageFailed;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-label={`${item.name}، ${formattedPrice}`}
      className={`group flex h-full min-h-[17rem] w-full flex-col overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] text-right shadow-[0_8px_22px_rgba(0,0,0,0.06)] transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] focus-visible:ring-offset-2 ${
        disabled
          ? "cursor-not-allowed opacity-65"
          : "hover:-translate-y-0.5 hover:border-[var(--brand-accent)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.1)] active:translate-y-0 active:scale-[0.995]"
      }`}
    >
      <div className="relative aspect-[1.55/1] w-full shrink-0 overflow-hidden bg-black/5">
        {hasImage ? (
          <>
            {!imageLoaded ? (
              <div className="absolute inset-0 animate-pulse bg-black/10" />
            ) : null}
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              decoding="async"
              className={`h-full w-full object-cover transition-[opacity,transform] duration-200 ease-out group-hover:scale-[1.025] ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageFailed(true)}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/5 text-[var(--brand-muted)]">
            <ImageOff className="h-9 w-9" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
        <span className="absolute right-3 top-3 rounded-full border border-white/35 bg-black/35 px-3 py-1.5 text-sm font-black text-white shadow-sm backdrop-blur-md">
          {formattedPrice}
        </span>
        {disabled ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <span className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white shadow-sm">
              غير متاح
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col border-t border-[var(--brand-border)] bg-gradient-to-b from-[var(--brand-surface)] to-black/[0.025] p-4 transition-colors duration-200 group-hover:to-[var(--brand-accent)]/10">
        <h3 className="line-clamp-2 text-base font-black leading-6 text-[var(--brand-text)]">
          {item.name}
        </h3>
        {item.description.trim() ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--brand-muted)]">
            {item.description}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="line-clamp-1 text-[11px] font-semibold text-[var(--brand-muted)]">
            {item.category}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--brand-primary)]">
            <Plus className="h-3.5 w-3.5" />
            إضافة للطلب
          </span>
        </div>
      </div>
    </button>
  );
}
