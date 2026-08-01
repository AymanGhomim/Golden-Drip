import { cn } from "@/lib/utils";
import { Search, ShoppingCart, Package, FileX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: "search" | "cart" | "package" | "file";
  action?: React.ReactNode;
  className?: string;
}

const iconMap = {
  search: Search,
  cart: ShoppingCart,
  package: Package,
  file: FileX,
};

export function EmptyState({ title, description, icon = "search", action, className }: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
