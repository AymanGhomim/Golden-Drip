"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AdminStatCardProps = {
  label: string;
  value: React.ReactNode;
  detail?: string;
  icon?: LucideIcon;
  change?: string;
  positive?: boolean;
};

export function AdminStatCard({
  label,
  value,
  detail,
  icon: Icon,
  change,
  positive = true,
}: AdminStatCardProps) {
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="overflow-hidden rounded-md border-border/70 bg-card text-foreground shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md">
      <CardContent className="p-3.5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {label}
            </p>
            <div className="mt-1 text-xl font-black tracking-tight text-foreground">{value}</div>
          </div>
          {Icon ? (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/12 text-accent">
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
        </div>
        <div className="flex min-h-5 items-center justify-between gap-2">
          {detail ? (
            <p className="truncate text-[0.68rem] font-medium text-muted-foreground">{detail}</p>
          ) : (
            <span />
          )}
          {change ? (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-bold",
                positive ? "bg-emerald-500/12 text-emerald-700" : "bg-amber-500/14 text-amber-700",
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {change}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
