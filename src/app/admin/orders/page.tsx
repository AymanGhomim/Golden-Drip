"use client";

import { Price } from "@/components/shared/price";
import { AdminDataPage } from "@/components/admin/admin-data-page";
import { Badge } from "@/components/ui/badge";
import { mockOrders } from "@/mocks/orders.mock";
import { useAdminLocale } from "@/providers/admin-locale-provider";
import type { Order, OrderStatus } from "@/types/order.types";

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
          tableTitle: "Order list",
          tableDescription: "All customer orders with table number, contents, status, and totals.",
          order: "Order",
          table: "Table",
          contents: "Contents",
          status: "Status",
          total: "Total",
          totalOrders: "Total orders",
          activeOrders: "Active orders",
          value: "Orders value",
          items: "Items ordered",
        }
      : {
          eyebrow: "إدارة جولدن دريب",
          title: "الطلبات",
          description: "تابع كل طلب حسب رقم الترابيزة وراجع محتوى الطلب بالكامل.",
          tableTitle: "قائمة الطلبات",
          tableDescription: "كل طلبات العملاء مع رقم الترابيزة والمحتوى والحالة والإجمالي.",
          order: "الطلب",
          table: "الترابيزة",
          contents: "المحتوى",
          status: "الحالة",
          total: "الإجمالي",
          totalOrders: "إجمالي الطلبات",
          activeOrders: "طلبات نشطة",
          value: "قيمة الطلبات",
          items: "أصناف مطلوبة",
        };

  const activeOrders = mockOrders.filter(
    (order) => order.status !== "COMPLETED" && order.status !== "CANCELLED"
  );
  const ordersTotal = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const itemsTotal = mockOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  const columns = [
    {
      key: "order",
      header: text.order,
      cell: (order: Order) => <span className="font-semibold">{order.orderNumber}</span>,
    },
    {
      key: "table",
      header: text.table,
      cell: (order: Order) => <span className="font-semibold">#{order.tableNumber}</span>,
    },
    {
      key: "contents",
      header: text.contents,
      cell: (order: Order) => (
        <div className="max-w-md space-y-1">
          {order.items.map((item) => (
            <p key={item.id} className="text-sm">
              <span className="font-semibold">{item.quantity}x</span> {item.productName}
              {item.notes ? <span className="text-muted-foreground"> · {item.notes}</span> : null}
            </p>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      header: text.status,
      cell: (order: Order) => <Badge className={statusStyle[order.status]}>{order.status}</Badge>,
    },
    {
      key: "total",
      header: text.total,
      cell: (order: Order) => <Price value={order.total} locale={locale} />,
    },
  ];

  return (
    <AdminDataPage
      eyebrow={text.eyebrow}
      title={text.title}
      description={text.description}
      stats={[
        { label: text.totalOrders, value: mockOrders.length },
        { label: text.activeOrders, value: activeOrders.length },
        { label: text.value, value: <Price value={ordersTotal} locale={locale} /> },
        { label: text.items, value: itemsTotal },
      ]}
      tableTitle={text.tableTitle}
      tableDescription={text.tableDescription}
      columns={columns}
      data={mockOrders}
      keyExtractor={(order) => order.id}
    />
  );
}
