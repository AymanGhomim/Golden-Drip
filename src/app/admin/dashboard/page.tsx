"use client";

import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  ReceiptText,
  TableProperties,
  Users,
} from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockDashboardStats, mockRecentOrders } from "@/mocks/dashboard.mock";
import { useAdminLocale } from "@/providers/admin-locale-provider";

const statusStyle: Record<string, string> = {
  NEW: "bg-sky-500/15 text-sky-300",
  PREPARING: "bg-amber-500/15 text-amber-300",
  READY: "bg-emerald-500/15 text-emerald-300",
  COMPLETED: "bg-muted text-muted-foreground",
};

export default function AdminDashboardPage() {
  const { locale } = useAdminLocale();
  const text =
    locale === "en"
      ? {
          overview: "Operations overview",
          title: "Dashboard",
          description: "A clean snapshot of orders, revenue, and live service flow.",
          live: "Open live orders",
          total: "Total orders",
          revenue: "Revenue",
          tables: "Active tables",
          pending: "Pending orders",
          recent: "Recent orders",
          latest: "Latest customer orders from the cafe.",
          glance: "Today at a glance",
          viewAll: "View all",
          headerTitle: "Good day, Golden Drip",
          headerText: "Monitor QR orders, tables, and cafe performance from one place.",
          today: "Today",
          alerts: "No urgent alerts",
        }
      : {
          overview: "نظرة عامة على التشغيل",
          title: "لوحة التحكم",
          description: "ملخص واضح للطلبات والإيرادات وحركة الخدمة الحالية.",
          live: "فتح الطلبات الحالية",
          total: "إجمالي الطلبات",
          revenue: "الإيرادات",
          tables: "الطاولات النشطة",
          pending: "طلبات معلقة",
          recent: "أحدث الطلبات",
          latest: "آخر طلبات العملاء في الكافيه.",
          glance: "ملخص اليوم",
          viewAll: "عرض الكل",
          headerTitle: "نهارك سعيد، جولدن دريب",
          headerText: "تابع طلبات QR والترابيزات وأداء الكافيه من مكان واحد.",
          today: "اليوم",
          alerts: "لا توجد تنبيهات عاجلة",
        };

  const stats = [
    { label: text.total, value: mockDashboardStats.totalOrders, icon: ClipboardList, detail: "+12%" },
    {
      label: text.revenue,
      value: <Price value={mockDashboardStats.totalRevenue} locale={locale} />,
      icon: ReceiptText,
      detail: "+8%",
    },
    { label: text.tables, value: mockDashboardStats.activeTables, icon: TableProperties, detail: "80%" },
    { label: text.pending, value: mockDashboardStats.pendingOrders, icon: Users, detail: "Live" },
  ];

  return (
    <AdminShell>
      <section className="animate-content-enter mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-md border bg-card px-5 py-4 shadow-sm sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">{text.headerTitle}</h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{text.headerText}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm font-semibold">
              <CalendarDays className="h-4 w-4 text-accent" />
              {text.today}
            </span>
            <span className="inline-flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm font-semibold">
              <Bell className="h-4 w-4 text-emerald-500" />
              {text.alerts}
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border bg-card shadow-sm">
          <div className="relative p-6 sm:p-7">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-primary to-accent" />
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                  {text.overview}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{text.title}</h1>
                <p className="mt-2 max-w-xl leading-7 text-muted-foreground">{text.description}</p>
              </div>
              <Button className="h-11 gap-2 rounded-md shadow-sm">
                <DoorOpen className="h-4 w-4" />
                {text.live}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="rounded-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardContent className="p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                    {stat.detail}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Card className="rounded-md">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b p-5">
                <div>
                  <h2 className="font-semibold">{text.recent}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{text.latest}</p>
                </div>
                <Button variant="ghost" size="sm">
                  {text.viewAll}
                </Button>
              </div>
              <div className="divide-y">
                {mockRecentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-medium">
                        {order.orderNumber}
                        <span className="font-normal text-muted-foreground"> · Table {order.tableNumber}</span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        <Price value={order.total} locale={locale} />
                      </p>
                    </div>
                    <Badge className={statusStyle[order.status]}>{order.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md">
            <CardContent className="p-5">
              <h2 className="font-semibold">{text.glance}</h2>
              <div className="mt-6 space-y-5">
                <Metric label="Order completion" value={74} />
                <Metric label="Table occupancy" value={80} />
                <Metric label="Customer satisfaction" value={96} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AdminShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
