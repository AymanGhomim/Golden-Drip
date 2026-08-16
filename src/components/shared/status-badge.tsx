import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, STATUS_STYLES } from "@/constants/status-presentation";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 whitespace-nowrap font-bold before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-current",
        STATUS_STYLES[status] || "",
        className,
      )}
    >
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}
