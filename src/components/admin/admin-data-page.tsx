"use client";

import { Plus } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type AdminStat = {
  label: string;
  value: React.ReactNode;
  detail?: string;
};

interface AdminDataPageProps<T> {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
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
  stats,
  tableTitle,
  tableDescription,
  columns,
  data,
  keyExtractor,
}: AdminDataPageProps<T>) {
  return (
    <AdminShell>
      <section className="animate-content-enter mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-md border bg-card shadow-sm">
          <div className="relative p-6 sm:p-7">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-primary to-accent" />
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                  {eyebrow}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
                <p className="mt-2 max-w-xl leading-7 text-muted-foreground">{description}</p>
              </div>
              {actionLabel ? (
                <Button className="h-11 gap-2 rounded-md shadow-sm">
                  <Plus className="h-4 w-4" />
                  {actionLabel}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-md">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="mt-2 text-3xl font-bold">{stat.value}</div>
                {stat.detail ? (
                  <p className="mt-2 text-xs font-medium text-muted-foreground">{stat.detail}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 overflow-hidden rounded-md">
          <CardContent className="p-0">
            <div className="border-b p-5">
              <h2 className="font-semibold">{tableTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{tableDescription}</p>
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
