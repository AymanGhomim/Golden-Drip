import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export interface BreadcrumbItem { label: string; href?: string }

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return <nav dir="rtl" aria-label="مسار الصفحة" className="mb-3 overflow-x-auto">
    <ol className="flex min-w-max items-center gap-1 text-xs text-muted-foreground">
      {items.map((item, index) => <li key={`${item.label}-${index}`} className="flex items-center gap-1">
        {index ? <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        {item.href ? <Link href={item.href} className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{item.label}</Link> : <span aria-current="page" className="font-semibold text-foreground">{item.label}</span>}
      </li>)}
    </ol>
  </nav>;
}
