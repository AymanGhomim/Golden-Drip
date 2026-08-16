"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";

export type SmartColumn<T> = {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  sortValue?: (item: T) => string | number;
  hideable?: boolean;
  sticky?: boolean;
  className?: string;
};

type SortState = { key: string; direction: "asc" | "desc" } | null;

export function SmartDataTable<T>({
  data,
  columns,
  keyExtractor,
  storageKey,
  mobileCard,
  emptyTitle = "لا توجد بيانات",
  emptyDescription,
  initialSort,
}: {
  data: T[];
  columns: SmartColumn<T>[];
  keyExtractor: (item: T) => string;
  storageKey: string;
  mobileCard: (item: T) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  initialSort?: SortState;
}) {
  const [sort, setSort] = useState<SortState>(initialSort ?? null);
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => {
    try {
      setCompact(window.localStorage.getItem(`${storageKey}:compact`) === "true");
      const stored = JSON.parse(window.localStorage.getItem(`${storageKey}:hidden`) || "[]");
      setHidden(Array.isArray(stored) ? stored : []);
    } catch {
      setHidden([]);
    }
  }, [storageKey]);

  const visibleColumns = columns.filter((column) => !hidden.includes(column.key));
  const sorted = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((item) => item.key === sort.key);
    if (!column?.sortValue) return data;
    return [...data].sort((left, right) => {
      const a = column.sortValue!(left);
      const b = column.sortValue!(right);
      const result =
        typeof a === "number" && typeof b === "number"
          ? a - b
          : String(a).localeCompare(String(b), "ar", { numeric: true });
      return sort.direction === "asc" ? result : -result;
    });
  }, [columns, data, sort]);
  const pagination = usePagination(
    sorted,
    `${storageKey}:${sort?.key ?? ""}:${sort?.direction ?? ""}:${data.map(keyExtractor).join("|")}`,
  );

  const toggleColumn = (key: string) => {
    setHidden((current) => {
      const next = current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key];
      window.localStorage.setItem(`${storageKey}:hidden`, JSON.stringify(next));
      return next;
    });
  };
  const toggleDensity = () => {
    setCompact((current) => {
      window.localStorage.setItem(`${storageKey}:compact`, String(!current));
      return !current;
    });
  };
  const changeSort = (column: SmartColumn<T>) => {
    if (!column.sortValue) return;
    setSort((current) =>
      current?.key === column.key
        ? current.direction === "asc"
          ? { key: column.key, direction: "desc" }
          : null
        : { key: column.key, direction: "asc" },
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/15 px-4 py-3">
        <p className="text-xs font-bold text-muted-foreground">
          {data.length.toLocaleString("ar-EG")} نتيجة
        </p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="h-9 gap-2" onClick={toggleDensity}>
            <Rows3 className="h-4 w-4" />
            {compact ? "عرض مريح" : "عرض مضغوط"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-9 gap-2">
                <Columns3 className="h-4 w-4" />
                الأعمدة
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 text-right">
              <DropdownMenuLabel>الأعمدة الظاهرة</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.filter((column) => column.hideable !== false).map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={!hidden.includes(column.key)}
                  onCheckedChange={() => toggleColumn(column.key)}
                  onSelect={(event) => event.preventDefault()}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {data.length ? (
        <>
          <div className="hidden overflow-auto md:block">
            <table data-smart-table className="w-full min-w-[900px] text-right text-sm">
              <thead>
                <tr>
                  {visibleColumns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "px-4 text-xs font-black",
                        column.sticky && "sticky left-0 z-20 bg-muted",
                        column.className,
                      )}
                    >
                      <button
                        type="button"
                        disabled={!column.sortValue}
                        onClick={() => changeSort(column)}
                        className="flex items-center gap-1.5 whitespace-nowrap disabled:cursor-default"
                      >
                        {column.label}
                        {column.sortValue ? (
                          sort?.key === column.key ? (
                            sort.direction === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                          ) : <ArrowUpDown className="h-3.5 w-3.5 opacity-45" />
                        ) : null}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagination.items.map((item) => (
                  <tr key={keyExtractor(item)}>
                    {visibleColumns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          compact ? "px-4 py-2" : "px-4 py-3.5",
                          column.sticky && "sticky left-0 z-10 bg-card shadow-[-8px_0_16px_-14px_hsl(var(--foreground))]",
                          column.className,
                        )}
                      >
                        {column.render(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={cn("grid gap-3 p-3 md:hidden", compact && "gap-2")}>
            {pagination.items.map((item) => (
              <div key={keyExtractor(item)}>{mobileCard(item)}</div>
            ))}
          </div>
          <Pagination
            {...pagination.state}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        </>
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} icon="file" />
      )}
    </div>
  );
}
