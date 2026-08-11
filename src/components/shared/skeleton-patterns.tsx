import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function TableSkeleton({ columns = 6, rows = 8, className }: { columns?: number; rows?: number; className?: string }) {
  return <div className={cn("overflow-hidden rounded-xl border bg-card", className)} role="status" aria-label="جاري تحميل الجدول">
    <div className="grid gap-3 border-b bg-muted/40 p-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(5rem, 1fr))` }}>{Array.from({ length: columns }, (_, index) => <Skeleton key={index} className="h-4" />)}</div>
    {Array.from({ length: rows }, (_, row) => <div key={row} className="grid gap-3 border-b p-4 last:border-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(5rem, 1fr))` }}>{Array.from({ length: columns }, (_, col) => <Skeleton key={col} className="h-5" />)}</div>)}
    <span className="sr-only">جاري تحميل البيانات...</span>
  </div>;
}

export function CardGridSkeleton({ cards = 4, className }: { cards?: number; className?: string }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)} role="status" aria-label="جاري تحميل البطاقات">{Array.from({ length: cards }, (_, index) => <div key={index} className="space-y-3 rounded-xl border bg-card p-5"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-8 w-1/3" /><Skeleton className="h-3 w-full" /></div>)}</div>;
}

export function DashboardSkeleton() { return <div className="space-y-5 p-5"><div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72 max-w-full" /></div><CardGridSkeleton /><div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-72 rounded-xl" /><Skeleton className="h-72 rounded-xl" /></div><TableSkeleton columns={5} rows={5} /></div>; }

export function FormSkeleton() { return <div className="space-y-5 rounded-xl border bg-card p-5" role="status" aria-label="جاري تحميل النموذج">{Array.from({ length: 5 }, (_, index) => <div key={index} className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-10 w-full" /></div>)}</div>; }

export function DetailsSkeleton() { return <div className="space-y-5"><Skeleton className="h-9 w-56" /><div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="space-y-3 rounded-xl border bg-card p-5"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>)}</div></div>; }
