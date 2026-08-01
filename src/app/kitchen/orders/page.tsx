"use client";

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

export default function KitchenOrdersPage() {
  const { locale } = useAdminLocale();
  const kitchenOrders = mockOrders.filter((order) => order.status !== "COMPLETED");
  const preparing = mockOrders.filter((order) => order.status === "PREPARING").length;
  const ready = mockOrders.filter((order) => order.status === "READY").length;
  const text =
    locale === "en"
      ? {
          eyebrow: "Golden Drip kitchen",
          title: "Kitchen orders",
          description: "Follow preparation status for incoming drinks and offers.",
          tableTitle: "Preparation queue",
          tableDescription: "Orders waiting for the team, grouped by table and contents.",
          order: "Order",
          table: "Table",
          items: "Items",
          status: "Status",
          queue: "In queue",
          preparing: "Preparing",
          ready: "Ready",
          totalItems: "Items to prepare",
        }
      : {
          eyebrow: "مطبخ جولدن دريب",
          title: "طلبات المطبخ",
          description: "متابعة حالة تحضير المشروبات والعروض الجديدة.",
          tableTitle: "قائمة التحضير",
          tableDescription: "الطلبات المنتظرة للفريق مرتبة حسب الترابيزة والمحتوى.",
          order: "الطلب",
          table: "الترابيزة",
          items: "الأصناف",
          status: "الحالة",
          queue: "في الانتظار",
          preparing: "قيد التحضير",
          ready: "جاهز",
          totalItems: "أصناف للتحضير",
        };

  const itemCount = kitchenOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  const columns = [
    { key: "order", header: text.order, cell: (order: Order) => <span className="font-semibold">{order.orderNumber}</span> },
    { key: "table", header: text.table, cell: (order: Order) => <span className="font-semibold">#{order.tableNumber}</span> },
    {
      key: "items",
      header: text.items,
      cell: (order: Order) => (
        <div className="space-y-1">
          {order.items.map((item) => (
            <p key={item.id} className="text-sm">
              <span className="font-semibold">{item.quantity}x</span> {item.productName}
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
  ];

  return (
    <AdminDataPage
      eyebrow={text.eyebrow}
      title={text.title}
      description={text.description}
      stats={[
        { label: text.queue, value: kitchenOrders.length },
        { label: text.preparing, value: preparing },
        { label: text.ready, value: ready },
        { label: text.totalItems, value: itemCount },
      ]}
      tableTitle={text.tableTitle}
      tableDescription={text.tableDescription}
      columns={columns}
      data={kitchenOrders}
      keyExtractor={(order) => order.id}
    />
  );
}
