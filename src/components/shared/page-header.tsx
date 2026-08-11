import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  breadcrumbs?: React.ReactNode;
}

export function PageHeader({ title, description, children, className, breadcrumbs }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-1 pb-4", className)}>
      {breadcrumbs ? <nav aria-label="مسار الصفحة" className="mb-2 text-xs text-muted-foreground">{breadcrumbs}</nav> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {children}
      </div>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </header>
  );
}
