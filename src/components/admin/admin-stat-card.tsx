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
  tone?: "neutral" | "blue" | "green" | "amber" | "violet" | "red";
  active?: boolean;
  onClick?: () => void;
};

export function AdminStatCard({
  label,
  value,
  detail,
  icon: Icon,
  change,
  positive = true,
  tone = "neutral",
  active = false,
  onClick,
}: AdminStatCardProps) {
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;
  const toneClasses = {
    neutral: "border-primary/10 bg-primary/[0.06] text-primary",
    blue: "border-blue-500/15 bg-blue-500/10 text-blue-700",
    green: "border-emerald-500/15 bg-emerald-500/10 text-emerald-700",
    amber: "border-amber-500/15 bg-amber-500/10 text-amber-700",
    violet: "border-violet-500/15 bg-violet-500/10 text-violet-700",
    red: "border-red-500/15 bg-red-500/10 text-red-700",
  }[tone];

  const card = (
    <Card className={cn("group h-full overflow-hidden transition duration-200 hover:border-primary/20 hover:shadow-lg", active && "border-primary/40 ring-2 ring-primary/10")}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-muted-foreground">{label}</p>
          {Icon ? (
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105", toneClasses)}>
              <Icon className="h-[1.125rem] w-[1.125rem]" />
            </span>
          ) : null}
        </div>
        <div className="mt-4 text-[1.65rem] font-black leading-none tracking-tight text-foreground [font-variant-numeric:tabular-nums]">
          {value}
        </div>
        {detail || change ? (
          <div className="mt-4 flex min-h-6 items-center justify-between gap-2 border-t border-border/60 pt-3">
            {detail ? (
              <p className="truncate text-xs font-medium text-muted-foreground">{detail}</p>
            ) : <span />}
            {change ? (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[0.68rem] font-bold",
                  positive ? "bg-emerald-500/12 text-emerald-700" : "bg-amber-500/14 text-amber-700",
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {change}
              </span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
  return onClick ? (
    <button type="button" className="block h-full w-full text-right" onClick={onClick} aria-pressed={active}>
      {card}
    </button>
  ) : card;
}
