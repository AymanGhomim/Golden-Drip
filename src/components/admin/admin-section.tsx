"use client";

import {
  ArrowUpRight,
  ClipboardCheck,
  LayoutGrid,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminLocale } from "@/providers/admin-locale-provider";

type LocalizedText = [string, string];

export function AdminSection({
  title,
  description,
  count,
  label,
}: {
  title: LocalizedText;
  description: LocalizedText;
  count: number;
  label: LocalizedText;
}) {
  const { locale } = useAdminLocale();
  const i = locale === "en" ? 0 : 1;
  const activeCount = Math.max(0, count - 1);
  const completion = Math.min(96, Math.max(48, count * 11));

  const text = {
    eyebrow: locale === "en" ? "Golden Drip management" : "إدارة جولدن دريب",
    add: locale === "en" ? "Add new" : "إضافة جديد",
    active: locale === "en" ? "Active" : "نشط",
    ready: locale === "en" ? "Ready today" : "جاهز اليوم",
    performance: locale === "en" ? "Performance" : "الأداء",
    overview: locale === "en" ? "Overview" : "نظرة عامة",
    health: locale === "en" ? "Section health" : "حالة القسم",
    recent: locale === "en" ? "Recent activity" : "آخر النشاط",
    updated: locale === "en" ? "Updated moments ago" : "تم التحديث منذ قليل",
    synced: locale === "en" ? "Menu sync is healthy" : "مزامنة المنيو تعمل جيدًا",
    reviewed: locale === "en" ? "Content reviewed" : "تمت مراجعة المحتوى",
    optimized: locale === "en" ? "Ready for service" : "جاهز للخدمة",
  };

  return (
    <AdminShell>
      <section className="animate-content-enter mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-md border bg-card shadow-sm">
          <div className="relative p-6 sm:p-7">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-primary to-accent" />
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                  {text.eyebrow}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title[i]}</h1>
                <p className="mt-2 max-w-xl leading-7 text-muted-foreground">{description[i]}</p>
              </div>
              <Button className="h-11 gap-2 rounded-md shadow-sm">
                <Plus className="h-4 w-4" />
                {text.add}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={label[i]} value={count} detail={text.overview} icon={LayoutGrid} />
          <StatCard label={text.active} value={activeCount} detail={text.ready} icon={ClipboardCheck} />
          <StatCard label={text.performance} value={`${completion}%`} detail="+8%" icon={TrendingUp} />
          <StatCard label={text.health} value="A+" detail={text.synced} icon={Sparkles} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <Card className="rounded-md">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b p-5">
                <div>
                  <h2 className="font-semibold">{text.recent}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{text.updated}</p>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  Live
                </Badge>
              </div>
              <div className="divide-y">
                {[text.synced, text.reviewed, text.optimized].map((item, index) => (
                  <div key={item} className="flex items-center justify-between gap-4 p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-sm font-bold text-accent">
                        {index + 1}
                      </span>
                      <p className="font-medium">{item}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md">
            <CardContent className="p-5">
              <h2 className="font-semibold">{text.health}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{description[i]}</p>
              <div className="mt-6 space-y-5">
                <ProgressMetric label={text.active} value={completion} />
                <ProgressMetric label={text.performance} value={Math.max(50, completion - 12)} />
                <ProgressMetric label={text.ready} value={Math.min(98, completion + 5)} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="rounded-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <div className="text-3xl font-bold">{value}</div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function ProgressMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-accent" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
