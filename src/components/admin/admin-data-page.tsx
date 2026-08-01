"use client";

import { Check, RotateCcw, Search, SlidersHorizontal, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatCard, type AdminStatCardProps } from "@/components/admin/admin-stat-card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AdminStat = AdminStatCardProps;

export interface AdminFilterOption<T> {
  label: string;
  value: string;
  predicate: (item: T) => boolean;
}

export interface AdminFilterGroup<T> {
  label: string;
  allLabel: string;
  options: AdminFilterOption<T>[];
}

interface AdminDataPageProps<T> {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionContent?: React.ReactNode;
  stats: AdminStat[];
  tableTitle: string;
  tableDescription: string;
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchValue?: (item: T) => string;
  filterLabel?: string;
  allFilterLabel?: string;
  filterOptions?: AdminFilterOption<T>[];
  filterGroups?: AdminFilterGroup<T>[];
  emptyMessage?: string;
  emptyDescription?: string;
}

export function AdminDataPage<T>({
  eyebrow,
  title,
  description,
  actionLabel,
  actionContent,
  stats,
  tableTitle,
  tableDescription,
  columns,
  data,
  keyExtractor,
  searchPlaceholder = "Search",
  searchValue,
  filterLabel = "Filter",
  allFilterLabel = "All",
  filterOptions = [],
  filterGroups,
  emptyMessage,
  emptyDescription,
}: AdminDataPageProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [draftFilters, setDraftFilters] = useState<Record<string, string>>({});
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const resolvedFilterGroups = useMemo(
    () =>
      filterGroups ??
      (filterOptions.length > 0
        ? [
            {
              label: filterLabel,
              allLabel: allFilterLabel,
              options: filterOptions,
            },
          ]
        : []),
    [allFilterLabel, filterGroups, filterLabel, filterOptions]
  );
  const hasControls = Boolean(searchValue) || resolvedFilterGroups.length > 0;
  const activeFilterCount = Object.values(activeFilters).filter((value) => value !== "all").length;
  const isArabicControls = filterLabel !== "Filter";
  const filterTitle = filterLabel === "Filter" ? "Filter results" : "تصفية النتائج";
  const filterDescription =
    filterLabel === "Filter" ? "Choose what you need to reach results faster." : "اختر ما يناسبك للوصول للنتائج بسرعة.";
  const applyFilterLabel = filterLabel === "Filter" ? "Apply filters" : "تطبيق التصفية";
  const clearFilterLabel = filterLabel === "Filter" ? "Clear filters" : "مسح الفلاتر";
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        !searchValue ||
        !normalizedSearchQuery ||
        searchValue(item).toLowerCase().includes(normalizedSearchQuery);
      const matchesFilters = resolvedFilterGroups.every((group) => {
        const activeValue = activeFilters[group.label] ?? "all";
        const selectedFilter = group.options.find((filter) => filter.value === activeValue);

        return !selectedFilter || selectedFilter.predicate(item);
      });

      return matchesSearch && matchesFilters;
    });
  }, [activeFilters, data, normalizedSearchQuery, resolvedFilterGroups, searchValue]);

  return (
    <AdminShell>
      <section className="animate-content-enter mx-auto w-full max-w-7xl px-3 py-5 sm:px-5">
        <div className="overflow-hidden rounded-md border bg-card shadow-sm">
          <div className="relative p-4 sm:p-5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-primary to-accent" />
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {eyebrow}
                </p>
                <h1 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
                <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
              {actionContent ?? (actionLabel ? (
                <Button className="h-9 gap-2 rounded-md px-3 text-sm shadow-sm">
                  <Plus className="h-4 w-4" />
                  {actionLabel}
                </Button>
              ) : null)}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <AdminStatCard key={stat.label} {...stat} />
          ))}
        </div>

        <Card className="mt-4 overflow-hidden rounded-md">
          <CardContent className="p-0">
            <div className="border-b p-4">
              <h2 className="text-sm font-semibold">{tableTitle}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{tableDescription}</p>
              {hasControls ? (
                <>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {searchValue ? (
                    <div className="relative w-full sm:max-w-sm">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-10 rounded-md pl-9 text-sm shadow-sm"
                      />
                    </div>
                  ) : null}
                  {resolvedFilterGroups.length > 0 ? (
                    <Button
                      type="button"
                      className="h-12 w-full justify-center gap-2 rounded-md bg-primary px-5 text-sm text-primary-foreground shadow-[0_8px_20px_rgba(42,16,10,0.18)] transition-all hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-[0_10px_24px_rgba(42,16,10,0.22)] sm:w-auto"
                      onClick={() => {
                        setDraftFilters(activeFilters);
                        setIsFilterPanelOpen((open) => !open);
                      }}
                    >
                      {filterLabel}
                      <SlidersHorizontal className="h-4 w-4" />
                      {activeFilterCount > 0 ? (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-foreground px-1.5 text-[0.68rem] font-bold text-primary">
                          {activeFilterCount}
                        </span>
                      ) : null}
                    </Button>
                  ) : null}
                </div>
                {isFilterPanelOpen && resolvedFilterGroups.length > 0 ? (
                  <div className="mt-4 overflow-hidden rounded-md border bg-background shadow-[0_16px_40px_rgba(42,16,10,0.10)]">
                    <div className={cn("flex items-center justify-between gap-3 border-b p-4", isArabicControls && "flex-row-reverse")}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => setIsFilterPanelOpen(false)}
                        aria-label={filterLabel === "Filter" ? "Close filters" : "إغلاق الفلاتر"}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className={cn("flex-1", isArabicControls ? "text-right" : "text-left")}>
                        <h3 className="text-sm font-semibold">{filterTitle}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{filterDescription}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <SlidersHorizontal className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="grid gap-4 p-4 sm:grid-cols-2">
                      {resolvedFilterGroups.map((group) => (
                        <div key={group.label} className="space-y-2">
                          <p className="text-xs font-medium text-foreground">{group.label}</p>
                          <Select
                            value={draftFilters[group.label] ?? "all"}
                            onValueChange={(value) =>
                              setDraftFilters((current) => ({
                                ...current,
                                [group.label]: value,
                              }))
                            }
                          >
                            <SelectTrigger className={cn("h-12 rounded-md bg-card text-sm shadow-sm", isArabicControls && "flex-row-reverse")}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{group.allLabel}</SelectItem>
                              {group.options.map((filter) => (
                                <SelectItem key={filter.value} value={filter.value}>
                                  {filter.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-3 border-t p-4 sm:grid-cols-[1fr_2.5fr]">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 gap-2 rounded-md"
                        onClick={() => {
                          setDraftFilters({});
                          setActiveFilters({});
                        }}
                      >
                        <RotateCcw className="h-4 w-4" />
                        {clearFilterLabel}
                      </Button>
                      <Button
                        type="button"
                        className="h-11 gap-2 rounded-md"
                        onClick={() => {
                          setActiveFilters(draftFilters);
                          setIsFilterPanelOpen(false);
                        }}
                      >
                        <Check className="h-4 w-4" />
                        {applyFilterLabel}
                      </Button>
                    </div>
                  </div>
                ) : null}
                </>
              ) : null}
            </div>
            <DataTable
              columns={columns}
              data={filteredData}
              keyExtractor={keyExtractor}
              className="rounded-none border-0"
              emptyMessage={emptyMessage}
              emptyDescription={emptyDescription}
            />
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
