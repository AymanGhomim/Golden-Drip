import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MenuCategoryButton({
  children,
  isSelected,
  onClick,
}: {
  children: ReactNode;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        "h-12 shrink-0 rounded-full border border-border/70 bg-card/70 px-6 text-sm font-bold text-muted-foreground shadow-[0_8px_18px_hsl(var(--foreground)/0.06)] backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/35 hover:bg-accent/10 hover:text-foreground hover:shadow-[0_12px_24px_hsl(var(--foreground)/0.09)] active:scale-[0.98]",
        isSelected &&
          "border-primary bg-primary text-primary-foreground shadow-[0_10px_22px_hsl(var(--foreground)/0.16)] hover:bg-primary/90 hover:text-primary-foreground",
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
