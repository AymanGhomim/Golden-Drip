"use client";

import Image from "next/image";
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
      };

  const availableProducts = mockProducts.filter((product) => product.isAvailable).length;
  const unavailableProducts = mockProducts.length - availableProducts;
  const salesToday = salesData[salesData.length - 1].value;
  const netProfit = 1480;

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
            <Button className="h-10 rounded-md">{text.live}</Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="overflow-hidden rounded-md border-[#3d2014] bg-[#21100a] text-[#fff5ee] shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-md bg-accent/20 text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        stat.positive ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {stat.positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-3xl font-black">{stat.value}</div>
                  <p className="mt-2 text-sm text-[#cdb5a5]">{stat.label}</p>
                  <p className="mt-1 text-xs text-[#a99080]">{text.vsYesterday}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-md">
            <CardContent className="p-5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{text.salesChart}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{text.chartHint}</p>
                </div>
              </div>
              <SalesLineChart locale={locale} />
            </CardContent>
          </Card>

          <Card className="rounded-md">
            <CardContent className="p-5">
              <h2 className="font-semibold">{text.distribution}</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-[10rem_1fr] xl:grid-cols-1">
                <SalesDonut />
                <div className="space-y-3">
                  {categorySales.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{isAr ? item.arLabel : item.label}</span>
                      </div>
                      <span className="text-sm font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="rounded-md">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b p-5">
                <div>
                  <h2 className="font-semibold">{text.recent}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{text.latest}</p>
                </div>
                <Button variant="ghost" size="sm">{text.viewAll}</Button>
              </div>
              <div className="divide-y">
                {mockRecentOrders.map((order) => (
                  <div key={order.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{text.table} {order.tableNumber}</p>
                    <Price value={order.total} locale={locale} />
                    <Badge className={statusStyle[order.status]}>{order.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-md">
            <CardContent className="p-5">
              <h2 className="font-semibold">{text.topProducts}</h2>
              <div className="mt-5 space-y-4">
                {topProducts.map((entry, index) => {
                  const product = mockProducts.find((item) => item.id === entry.id);
                  const progress = Math.round((entry.orders / topProducts[0].orders) * 100);
                  return product ? (
                    <div key={entry.id} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-sm font-bold text-accent">
                        {index + 1}
                      </span>
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-muted">
                        {product.image ? (
                          <Image src={product.image} alt={product.name} fill sizes="44px" className="object-cover" />
                        ) : (
                          <Coffee className="m-3 h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-3 text-sm">
                          <p className="truncate font-semibold">{product.name}</p>
                          <span className="text-muted-foreground">{entry.orders}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
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
  const max = Math.max(...salesData.map((item) => item.value));
  const points = salesData
    .map((item, index) => {
      const x = (index / (salesData.length - 1)) * 100;
      const y = 100 - (item.value / max) * 86;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div>
      <svg viewBox="0 0 100 110" className="h-64 w-full overflow-visible">
        <defs>
          <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.28" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={`0,100 ${points} 100,100`} fill="url(#salesFill)" stroke="none" />
        <polyline points={points} fill="none" stroke="hsl(var(--accent))" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        {salesData.map((item, index) => {
          const x = (index / (salesData.length - 1)) * 100;
          const y = 100 - (item.value / max) * 86;
          return (
            <g key={item.day}>
              <circle cx={x} cy={y} r="2.4" fill="hsl(var(--background))" stroke="hsl(var(--accent))" strokeWidth="1.8" />
              <text x={x} y="109" textAnchor="middle" className="fill-muted-foreground text-[3px]">
                {locale === "ar" ? item.arDay.slice(0, 3) : item.day}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function SalesDonut() {
  return (
    <div
      className="mx-auto h-40 w-40 rounded-full"
      style={{
        background:
          "conic-gradient(#f59e0b 0 34%, #38bdf8 34% 62%, #34d399 62% 80%, #f472b6 80% 100%)",
      }}
    >
      <div className="flex h-full w-full items-center justify-center rounded-full p-7">
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-card text-center">
          <span className="text-2xl font-black">100%</span>
          <span className="text-xs text-muted-foreground">Sales</span>
        </div>
      </div>
    </div>
  );
}
