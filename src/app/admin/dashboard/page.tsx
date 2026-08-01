"use client";

import Image from "next/image";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Coffee,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockDashboardStats, mockRecentOrders } from "@/mocks/dashboard.mock";
import { mockProducts } from "@/mocks/products.mock";
import { useAdminLocale } from "@/providers/admin-locale-provider";

const statusStyle: Record<string, string> = {
  NEW: "bg-sky-500/15 text-sky-300",
  PREPARING: "bg-amber-500/15 text-amber-300",
  READY: "bg-emerald-500/15 text-emerald-300",
  COMPLETED: "bg-muted text-muted-foreground",
};

const salesData = [
  { day: "Sat", arDay: "السبت", value: 2100, date: "Jul 26" },
  { day: "Sun", arDay: "الأحد", value: 2600, date: "Jul 27" },
  { day: "Mon", arDay: "الاثنين", value: 2300, date: "Jul 28" },
  { day: "Tue", arDay: "الثلاثاء", value: 3200, date: "Jul 29" },
  { day: "Wed", arDay: "الأربعاء", value: 2950, date: "Jul 30" },
  { day: "Thu", arDay: "الخميس", value: 3700, date: "Jul 31" },
  { day: "Fri", arDay: "الجمعة", value: 4100, date: "Aug 1" },
];

const categorySales = [
  { label: "Hot Coffee", arLabel: "قهوة ساخنة", value: 34, color: "#f59e0b" },
  { label: "Iced Coffee", arLabel: "قهوة باردة", value: 28, color: "#38bdf8" },
  { label: "Refreshers", arLabel: "مشروبات منعشة", value: 18, color: "#34d399" },
  { label: "Specials", arLabel: "عروض خاصة", value: 20, color: "#f472b6" },
];

const topProducts = [
  { id: "prod-6", orders: 42 },
  { id: "prod-3", orders: 37 },
  { id: "prod-16", orders: 31 },
  { id: "prod-13", orders: 27 },
  { id: "prod-19", orders: 22 },
];

export default function AdminDashboardPage() {
  const { locale } = useAdminLocale();
  const isAr = locale === "ar";
  const text = isAr
    ? {
        headerTitle: "نهارك سعيد، جولدن دريب",
        headerText: "تابع مبيعات اليوم وطلبات QR وحركة الترابيزات من مكان واحد.",
        today: "اليوم",
        alerts: "لا توجد تنبيهات عاجلة",
        live: "فتح الطلبات الحالية",
        salesToday: "مبيعات اليوم",
        activeOrders: "الطلبات النشطة",
        netProfit: "صافي الربح",
        availableProducts: "المنتجات المتاحة",
        unavailable: "غير متاح",
        vsYesterday: "مقارنة بأمس",
        salesChart: "مبيعات آخر 7 أيام",
        chartHint: "قيمة المبيعات بالجنيه",
        distribution: "توزيع المبيعات",
        recent: "أحدث الطلبات",
        latest: "آخر طلبات العملاء من المنيو.",
        viewAll: "عرض الكل",
        topProducts: "أكثر المنتجات مبيعًا",
        ordered: "مرة طلب",
        table: "ترابيزة",
        order: "الطلب",
        total: "الإجمالي",
        status: "الحالة",
      }
    : {
        headerTitle: "Good day, Golden Drip",
        headerText: "Monitor today's sales, QR orders, and table flow from one place.",
        today: "Today",
        alerts: "No urgent alerts",
        live: "Open live orders",
        salesToday: "Today's sales",
        activeOrders: "Active orders",
        netProfit: "Net profit",
        availableProducts: "Available products",
        unavailable: "unavailable",
        vsYesterday: "vs yesterday",
        salesChart: "Sales over 7 days",
        chartHint: "Sales value in EGP",
        distribution: "Sales distribution",
        recent: "Recent orders",
        latest: "Latest customer orders from the menu.",
        viewAll: "View all",
        topProducts: "Top selling products",
        ordered: "orders",
        table: "Table",
        order: "Order",
        total: "Total",
        status: "Status",
      };

  const availableProducts = mockProducts.filter((product) => product.isAvailable).length;
  const unavailableProducts = mockProducts.length - availableProducts;
  const salesToday = salesData[salesData.length - 1].value;
  const netProfit = 1480;
  const recentOrderColumns: DataTableColumn<(typeof mockRecentOrders)[number]>[] = [
    {
      key: "order",
      header: text.order,
      cell: (order) => <span className="font-semibold">{order.orderNumber}</span>,
    },
    {
      key: "table",
      header: text.table,
      cell: (order) => (
        <span className="text-muted-foreground">
          {text.table} {order.tableNumber}
        </span>
      ),
    },
    {
      key: "total",
      header: text.total,
      cell: (order) => <Price value={order.total} locale={locale} />,
    },
    {
      key: "status",
      header: text.status,
      cell: (order) => <Badge className={statusStyle[order.status]}>{order.status}</Badge>,
    },
  ];

  const stats = [
    {
      label: text.salesToday,
      value: <Price value={salesToday} locale={locale} currencyClassName="text-white/60" />,
      icon: ReceiptText,
      change: "+14%",
      positive: true,
    },
    {
      label: text.activeOrders,
      value: mockDashboardStats.pendingOrders,
      icon: ShoppingBag,
      change: "Live",
      positive: true,
    },
    {
      label: text.netProfit,
      value: <Price value={netProfit} locale={locale} currencyClassName="text-white/60" />,
      icon: ArrowUpRight,
      change: "+9%",
      positive: true,
    },
    {
      label: text.availableProducts,
      value: availableProducts,
      icon: PackageCheck,
      change: unavailableProducts > 0 ? `${unavailableProducts} ${text.unavailable}` : "Ready",
      positive: unavailableProducts === 0,
    },
  ];

  return (
    <AdminShell>
      <section className="animate-content-enter mx-auto w-full max-w-7xl px-3 py-5 sm:px-5">
        <div className="mb-4 flex flex-col justify-between gap-3 rounded-md border bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center">
          <div>
            <h1 className="text-lg font-bold sm:text-xl">{text.headerTitle}</h1>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{text.headerText}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-2.5 text-xs font-semibold">
              <CalendarDays className="h-3.5 w-3.5 text-accent" />
              {text.today}
            </span>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-background px-2.5 text-xs font-semibold">
              <Bell className="h-3.5 w-3.5 text-emerald-500" />
              {text.alerts}
            </span>
            <Button className="h-8 rounded-md px-3 text-xs">{text.live}</Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="overflow-hidden rounded-md border-[#3d2014] bg-[#21100a] text-[#fff5ee] shadow-sm">
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/20 text-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-bold ${
                        stat.positive ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {stat.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-2xl font-black">{stat.value}</div>
                  <p className="mt-1.5 text-xs text-[#cdb5a5]">{stat.label}</p>
                  <p className="mt-0.5 text-[0.68rem] text-[#a99080]">{text.vsYesterday}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-md">
            <CardContent className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">{text.salesChart}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{text.chartHint}</p>
                </div>
              </div>
              <SalesLineChart locale={locale} />
            </CardContent>
          </Card>

          <Card className="rounded-md">
            <CardContent className="p-4">
              <h2 className="text-sm font-semibold">{text.distribution}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-[8rem_1fr] xl:grid-cols-1">
                <SalesDonut />
                <div className="space-y-2.5">
                  {categorySales.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs">{isAr ? item.arLabel : item.label}</span>
                      </div>
                      <span className="text-xs font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-md">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <h2 className="text-sm font-semibold">{text.recent}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{text.latest}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">{text.viewAll}</Button>
              </div>
              <DataTable
                columns={recentOrderColumns}
                data={mockRecentOrders}
                keyExtractor={(order) => order.id}
                className="rounded-none border-0"
              />
            </CardContent>
          </Card>

          <Card className="rounded-md">
            <CardContent className="p-4">
              <h2 className="text-sm font-semibold">{text.topProducts}</h2>
              <div className="mt-4 space-y-3">
                {topProducts.map((entry, index) => {
                  const product = mockProducts.find((item) => item.id === entry.id);
                  const progress = Math.round((entry.orders / topProducts[0].orders) * 100);
                  return product ? (
                    <div key={entry.id} className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-xs font-bold text-accent">
                        {index + 1}
                      </span>
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-muted">
                        {product.image ? (
                          <Image src={product.image} alt={product.name} fill sizes="36px" className="object-cover" />
                        ) : (
                          <Coffee className="m-2.5 h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-3 text-xs">
                          <p className="truncate font-semibold">{product.name}</p>
                          <span className="text-muted-foreground">{entry.orders}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AdminShell>
  );
}

function SalesLineChart({ locale }: { locale: "en" | "ar" }) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={salesData} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey={locale === "ar" ? "arDay" : "day"}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            cursor={{ stroke: "hsl(var(--border))" }}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [`${Number(value).toLocaleString(locale === "ar" ? "ar-EG" : "en-US")} EGP`, "Sales"]}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--accent))"
            strokeWidth={2.4}
            fill="url(#salesGradient)"
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function SalesDonut() {
  return (
    <div className="mx-auto h-32 w-32">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categorySales}
            dataKey="value"
            nameKey="label"
            innerRadius={38}
            outerRadius={62}
            paddingAngle={3}
            stroke="hsl(var(--card))"
            strokeWidth={3}
          >
            {categorySales.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [`${value}%`, "Share"]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
