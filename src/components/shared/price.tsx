import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/config/app.config";

interface PriceProps {
  value: number;
  className?: string;
  currencyClassName?: string;
  locale?: "en" | "ar";
}

export function Price({ value, className, currencyClassName, locale = "en" }: PriceProps) {
  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      <span className="font-semibold">{value.toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}</span>
      <span className={cn("text-sm text-muted-foreground", currencyClassName)}>
        {locale === "ar" ? APP_CONFIG.currencySymbol : "EGP"}
      </span>
    </span>
  );
}
