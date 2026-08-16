"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "./empty-state";
import { TableSkeleton } from "./skeleton-patterns";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  keyExtractor: (item: T) => string;
  className?: string;
  skeletonRows?: number;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "لا توجد بيانات",
  emptyDescription,
  keyExtractor,
  className,
  skeletonRows = 8,
}: DataTableProps<T>) {
  if (loading) {
    return <TableSkeleton columns={columns.length} rows={skeletonRows} className={className} />;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyMessage} description={emptyDescription} icon="file" />;
  }

  return (
    <div className={cn("overflow-x-auto rounded-md border bg-card", className)}>
      <Table className="min-w-[680px] text-sm">
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "h-11 px-4 text-xs font-black tracking-wide",
                  col.className,
                  col.headerClassName,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={keyExtractor(item)}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn("px-4 py-3 align-middle", col.className, col.cellClassName)}
                >
                  {col.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
