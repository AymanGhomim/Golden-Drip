"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PaginationState } from "@/hooks/use-pagination";

interface PaginationProps extends PaginationState {
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({ page, pageSize, total, totalPages, onPageChange, onPageSizeChange, pageSizeOptions = [10, 20, 50] }: PaginationProps) {
  if (total === 0) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const windowStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const visiblePages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => Math.max(1, windowStart) + index,
  );

  return (
    <nav dir="rtl" aria-label="ترقيم الصفحات" className="flex flex-col gap-3 border-t bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground" aria-live="polite">
        عرض {first}–{last} من {total}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">عدد الصفوف</span>
        <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger aria-label="عدد الصفوف في الصفحة" className="h-9 w-20"><SelectValue /></SelectTrigger>
          <SelectContent dir="rtl">{pageSizeOptions.map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent>
        </Select>
        <Button type="button" variant="outline" size="icon" className="h-9 w-9" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="الصفحة السابقة">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <div className="hidden items-center gap-1 sm:flex">
          {visiblePages.map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              variant={pageNumber === page ? "default" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-lg text-xs"
              onClick={() => onPageChange(pageNumber)}
              aria-label={`الصفحة ${pageNumber}`}
              aria-current={pageNumber === page ? "page" : undefined}
            >
              {pageNumber}
            </Button>
          ))}
        </div>
        <span className="min-w-20 text-center text-xs font-semibold sm:hidden">{page} من {totalPages}</span>
        <Button type="button" variant="outline" size="icon" className="h-9 w-9" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="الصفحة التالية">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
