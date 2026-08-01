"use client";

import { Plus } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatCard, type AdminStatCardProps } from "@/components/admin/admin-stat-card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type AdminStat = AdminStatCardProps;

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
}: AdminDataPageProps<T>) {
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
            </div>
            <DataTable
              columns={columns}
              data={data}
              keyExtractor={keyExtractor}
              className="rounded-none border-0"
            />
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
