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
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={keyExtractor(item)}>
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
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
