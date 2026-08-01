import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  className?: string;
}

export function SectionHeader({ title, className }: SectionHeaderProps) {
  return (
    <h2 className={cn("text-lg font-semibold text-foreground", className)}>
      {title}
    </h2>
  );
}
