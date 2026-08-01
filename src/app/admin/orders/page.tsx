"use client";

import { Price } from "@/components/shared/price";
import { AdminDataPage } from "@/components/admin/admin-data-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockOrders } from "@/mocks/orders.mock";
import { useAdminLocale } from "@/providers/admin-locale-provider";
import type { Order, OrderStatus } from "@/types/order.types";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

const statusStyle: Record<OrderStatus, string> = {
  NEW: "border border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-300/30 dark:bg-sky-300/15 dark:text-sky-100",
  PREPARING: "border border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-300/30 dark:bg-amber-300/15 dark:text-amber-100",
  READY: "border border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-300/30 dark:bg-emerald-300/15 dark:text-emerald-100",
  COMPLETED: "border border-stone-300 bg-stone-100 text-stone-800 dark:border-stone-300/25 dark:bg-stone-200/10 dark:text-stone-100",
  CANCELLED: "border border-red-200 bg-red-100 text-red-800 dark:border-red-300/30 dark:bg-red-300/15 dark:text-red-100",
};

export default function OrdersPage() {
  const { locale } = useAdminLocale();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
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

  const actionText =
    locale === "en"
      ? {
          actions: "Actions",
          advance: "Move to next status",
          cancel: "Cancel order",
        }
      : {
          actions: "الإجراءات",
          advance: "نقل للحالة التالية",
          cancel: "إلغاء الطلب",
        };

  const activeOrders = orders.filter(
    (order) => order.status !== "COMPLETED" && order.status !== "CANCELLED"
  );
  const ordersTotal = orders.reduce((sum, order) => sum + order.total, 0);
  const itemsTotal = orders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  const nextStatusByStatus: Partial<Record<OrderStatus, OrderStatus>> = {
    NEW: "PREPARING",
    PREPARING: "READY",
    READY: "COMPLETED",
  };

  function advanceOrder(orderId: string) {
    setOrders((current) =>
      current.map((order) => {
        const nextStatus = nextStatusByStatus[order.status];

        return order.id === orderId && nextStatus ? { ...order, status: nextStatus } : order;
      })
    );
  }

  function cancelOrder(orderId: string) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status: "CANCELLED" } : order
      )
    );
  }

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
    {
      key: "actions",
      header: actionText.actions,
      headerClassName: "w-[96px] text-center",
      cellClassName: "w-[96px]",
      cell: (order: Order) => {
        const isFinished = order.status === "COMPLETED" || order.status === "CANCELLED";

        return (
          <div className="flex justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 border-emerald-300/60 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 disabled:opacity-40"
              onClick={() => advanceOrder(order.id)}
              disabled={isFinished}
              aria-label={actionText.advance}
              title={actionText.advance}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
              onClick={() => cancelOrder(order.id)}
              disabled={isFinished}
              aria-label={actionText.cancel}
              title={actionText.cancel}
            >
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];
  const controlsText =
    locale === "en"
      ? {
          search: "Search orders",
          all: "All orders",
          filter: "Filter",
          noResults: "No orders found",
          noResultsDescription: "Try another search or filter.",
        }
      : {
          search: "ابحث في الطلبات",
          all: "كل الطلبات",
          filter: "تصفية",
          noResults: "لا توجد طلبات",
          noResultsDescription: "جرب بحث أو تصفية مختلفة.",
        };

  const orderStatusFilterLabels: Record<OrderStatus, string> =
    locale === "en"
      ? {
          NEW: "New",
          PREPARING: "Preparing",
          READY: "Ready",
          COMPLETED: "Completed",
          CANCELLED: "Cancelled",
        }
      : {
          NEW: "جديد",
          PREPARING: "قيد التحضير",
          READY: "جاهز",
          COMPLETED: "مكتمل",
          CANCELLED: "ملغي",
        };

  return (
    <AdminDataPage
      eyebrow={text.eyebrow}
      title={text.title}
      description={text.description}
      stats={[
        { label: text.totalOrders, value: orders.length },
        { label: text.activeOrders, value: activeOrders.length },
        { label: text.value, value: <Price value={ordersTotal} locale={locale} /> },
        { label: text.items, value: itemsTotal },
      ]}
      tableTitle={text.tableTitle}
      tableDescription={text.tableDescription}
      columns={columns}
      data={orders}
      keyExtractor={(order) => order.id}
      searchPlaceholder={controlsText.search}
      searchValue={(order) =>
        `${order.orderNumber} ${order.tableNumber} ${order.status} ${order.items
          .map((item) => `${item.productName} ${item.notes ?? ""}`)
          .join(" ")}`
      }
      filterLabel={controlsText.filter}
      allFilterLabel={controlsText.all}
      filterOptions={[
        {
          label: orderStatusFilterLabels.NEW,
          value: "NEW",
          predicate: (order) => order.status === "NEW",
        },
        {
          label: orderStatusFilterLabels.PREPARING,
          value: "PREPARING",
          predicate: (order) => order.status === "PREPARING",
        },
        {
          label: orderStatusFilterLabels.READY,
          value: "READY",
          predicate: (order) => order.status === "READY",
        },
        {
          label: orderStatusFilterLabels.COMPLETED,
          value: "COMPLETED",
          predicate: (order) => order.status === "COMPLETED",
        },
        {
          label: orderStatusFilterLabels.CANCELLED,
          value: "CANCELLED",
          predicate: (order) => order.status === "CANCELLED",
        },
      ]}
      emptyMessage={controlsText.noResults}
      emptyDescription={controlsText.noResultsDescription}
    />
  );
}
