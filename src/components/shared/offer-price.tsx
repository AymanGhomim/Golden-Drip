import { APP_CONFIG } from "@/config/app.config";
import { cn } from "@/lib/utils";

interface OfferPriceProps {
  originalPrice: number;
  price: number;
  locale?: "en" | "ar";
  className?: string;
  variant?: "light" | "default";
}

export function OfferPrice({
  originalPrice,
  price,
  locale = "en",
  className,
  variant = "default",
}: OfferPriceProps) {
  const formatterLocale = locale === "ar" ? "ar-EG" : "en-US";
  const currency = locale === "ar" ? APP_CONFIG.currencySymbol : "EGP";

  return (
    <div className={cn("flex max-w-full flex-wrap items-end gap-2 sm:inline-flex sm:gap-4", className)}>
      <div className="space-y-0.5">
        <p
          className={cn(
            "text-[0.68rem] font-bold uppercase tracking-[0.16em]",
            variant === "light" ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {locale === "ar" ? "سعر العرض" : "Offer price"}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              "text-2xl font-black leading-none tracking-normal sm:text-4xl",
              variant === "light" ? "text-white drop-shadow-sm" : "text-foreground"
            )}
          >
            {price.toLocaleString(formatterLocale)}
          </span>
          <span
            className={cn(
              "text-sm font-bold",
              variant === "light" ? "text-white/80" : "text-muted-foreground"
            )}
          >
            {currency}
          </span>
        </div>
      </div>
      <div
        className={cn(
          "mb-0.5 rounded-md border px-2 py-1 text-[0.68rem] font-semibold sm:mb-1 sm:px-2.5 sm:text-xs",
          variant === "light"
            ? "border-white/25 bg-white/10 text-white/75 backdrop-blur-sm"
            : "border-border bg-muted text-muted-foreground"
        )}
      >
        <span className="line-through">
          {originalPrice.toLocaleString(formatterLocale)} {currency}
        </span>
      </div>
    </div>
  );
}
