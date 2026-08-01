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
import { LoadingState } from "./loading-state";
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
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "لا توجد بيانات",
  emptyDescription,
  keyExtractor,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return <LoadingState />;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyMessage} description={emptyDescription} icon="file" />;
  }

  return (
    <div className={cn("overflow-hidden rounded-md border bg-card", className)}>
      <Table className="text-xs">
        <TableHeader className="bg-muted/45">
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "h-9 px-3 text-[0.68rem] font-bold uppercase tracking-[0.08em]",
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
                  className={cn("px-3 py-2.5 align-middle", col.className, col.cellClassName)}
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
