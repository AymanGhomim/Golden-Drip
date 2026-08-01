"use client";

import { Clock, ReceiptText, TableProperties } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mockOrders } from "@/mocks/orders.mock";
import { useAdminLocale } from "@/providers/admin-locale-provider";
import type { OrderStatus } from "@/types/order.types";

const statusStyle: Record<OrderStatus, string> = {
  NEW: "bg-sky-500/15 text-sky-300",
  PREPARING: "bg-amber-500/15 text-amber-300",
  READY: "bg-emerald-500/15 text-emerald-300",
  COMPLETED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-destructive/15 text-destructive",
};

export default function OrdersPage() {
  const { locale } = useAdminLocale();
  const text =
    locale === "en"
      ? {
          eyebrow: "Golden Drip management",
          title: "Orders",
          description: "Track each order by table and review the full order contents.",
          totalOrders: "Total orders",
          activeOrders: "Active orders",
          totalRevenue: "Orders value",
          table: "Table",
          contents: "Order contents",
          notes: "Notes",
          itemTotal: "Item total",
          total: "Total",
        }
      : {
          eyebrow: "إدارة جولدن دريب",
          title: "الطلبات",
          description: "تابع كل طلب حسب رقم الترابيزة وراجع محتوى الطلب بالكامل.",
          totalOrders: "إجمالي الطلبات",
          activeOrders: "طلبات نشطة",
          totalRevenue: "قيمة الطلبات",
          table: "ترابيزة",
          contents: "محتوى الطلب",
          notes: "ملاحظات",
          itemTotal: "إجمالي الصنف",
          total: "الإجمالي",
        };

  const activeOrders = mockOrders.filter(
    (order) => order.status !== "COMPLETED" && order.status !== "CANCELLED"
  );
  const ordersTotal = mockOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <AdminShell>
      <section className="animate-content-enter mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-md border bg-card shadow-sm">
          <div className="relative p-6 sm:p-7">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-primary to-accent" />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {text.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{text.title}</h1>
            <p className="mt-2 max-w-xl leading-7 text-muted-foreground">{text.description}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard label={text.totalOrders} value={mockOrders.length} icon={ReceiptText} />
          <SummaryCard label={text.activeOrders} value={activeOrders.length} icon={Clock} />
          <SummaryCard
            label={text.totalRevenue}
            value={<Price value={ordersTotal} locale={locale} />}
            icon={TableProperties}
          />
        </div>

        <div className="mt-6 grid gap-5">
          {mockOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden rounded-md transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-0">
                <div className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
                      <h2 className="mt-1 flex items-center gap-2 text-xl font-bold">
                        <TableProperties className="h-5 w-5 text-accent" />
                        {text.table} {order.tableNumber}
                      </h2>
                    </div>
                    <Badge className={statusStyle[order.status]}>{order.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-6 lg:justify-end">
                    <div>
                      <p className="text-sm text-muted-foreground">{text.total}</p>
                      <Price value={order.total} locale={locale} className="mt-1 text-xl" />
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="mb-4 font-semibold">{text.contents}</h3>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="grid gap-3 rounded-md border bg-background/40 p-4 md:grid-cols-[1fr_auto]"
                      >
                        <div>
                          <p className="font-semibold">
                            {item.quantity}x {item.productName}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            <Price value={item.unitPrice} locale={locale} /> / item
                          </p>
                          {item.notes ? (
                            <p className="mt-2 rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">
                              {text.notes}: {item.notes}
                            </p>
                          ) : null}
                        </div>
                        <div className="md:text-end">
                          <p className="text-sm text-muted-foreground">{text.itemTotal}</p>
                          <Price value={item.totalPrice} locale={locale} className="mt-1 text-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="rounded-md">
      <CardContent className="p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
