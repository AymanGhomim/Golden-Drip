"use client";

import { Price } from "@/components/shared/price";
import { AdminDataPage } from "@/components/admin/admin-data-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mockOrders } from "@/mocks/orders.mock";
import { useAdminLocale } from "@/providers/admin-locale-provider";
import type { Order, OrderStatus, OrderType } from "@/types/order.types";
import { Activity, CheckCircle2, Eye, ReceiptText, ShoppingBag, WalletCards, XCircle } from "lucide-react";
import { useState } from "react";

const statusStyle: Record<OrderStatus, string> = {
  NEW: "border-sky-200 bg-sky-100 text-sky-800 hover:bg-sky-100 dark:border-sky-300/30 dark:bg-sky-300/15 dark:text-sky-100 dark:hover:bg-sky-300/15",
  PREPARING: "border-amber-200 bg-amber-100 text-amber-900 hover:bg-amber-100 dark:border-amber-300/30 dark:bg-amber-300/15 dark:text-amber-100 dark:hover:bg-amber-300/15",
  READY: "border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-300/30 dark:bg-emerald-300/15 dark:text-emerald-100 dark:hover:bg-emerald-300/15",
  COMPLETED: "border-stone-300 bg-stone-100 text-stone-800 hover:bg-stone-100 dark:border-stone-300/25 dark:bg-stone-200/10 dark:text-stone-100 dark:hover:bg-stone-200/10",
  CANCELLED: "border-red-200 bg-red-100 text-red-800 hover:bg-red-100 dark:border-red-300/30 dark:bg-red-300/15 dark:text-red-100 dark:hover:bg-red-300/15",
};

const orderTypeStyle: Record<OrderType, string> = {
  TABLE: "border-primary/20 bg-primary/10 text-primary hover:bg-primary/10",
  TAKEAWAY: "border-amber-200 bg-amber-100 text-amber-900 hover:bg-amber-100",
  DELIVERY: "border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
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

  const detailText =
    locale === "en"
      ? {
          view: "View order",
          title: "Order details",
          description: "Review table, contents, status, and totals.",
          subtotal: "Subtotal",
          createdAt: "Created at",
        }
      : {
          view: "عرض الطلب",
          title: "تفاصيل الطلب",
          description: "راجع الترابيزة، محتوى الطلب، الحالة، والإجمالي.",
          subtotal: "الإجمالي قبل الخدمة",
          createdAt: "وقت الطلب",
        };

  const typeText =
    locale === "en"
      ? {
          header: "Type",
          table: "Table",
          takeaway: "Take away",
          delivery: "Delivery",
          customer: "Customer",
          phone: "Phone",
          address: "Address",
          notes: "Notes",
        }
      : {
          header: "نوع الطلب",
          table: "ترابيزة",
          takeaway: "تيك أواي",
          delivery: "دليفري",
          customer: "العميل",
          phone: "الهاتف",
          address: "العنوان",
          notes: "ملاحظات",
        };

  const orderTypeLabels: Record<OrderType, string> = {
    TABLE: typeText.table,
    TAKEAWAY: typeText.takeaway,
    DELIVERY: typeText.delivery,
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
      key: "type",
      header: typeText.header,
      headerClassName: "w-[120px] text-center",
      cellClassName: "w-[120px] text-center",
      cell: (order: Order) => (
        <Badge variant="outline" className={orderTypeStyle[order.orderType]}>
          {orderTypeLabels[order.orderType]}
        </Badge>
      ),
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
      headerClassName: "w-[120px] text-center",
      cellClassName: "w-[120px] text-center",
      cell: (order: Order) => <Badge variant="outline" className={statusStyle[order.status]}>{order.status}</Badge>,
    },
    {
      key: "total",
      header: text.total,
      cell: (order: Order) => <Price value={order.total} locale={locale} />,
    },
    {
      key: "actions",
      header: actionText.actions,
      headerClassName: "w-[136px] text-center",
      cellClassName: "w-[136px]",
      cell: (order: Order) => {
        const isFinished = order.status === "COMPLETED" || order.status === "CANCELLED";

        return (
          <div className="flex justify-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-sky-300/60 text-sky-700 hover:bg-sky-50 hover:text-sky-800"
                  aria-label={detailText.view}
                  title={detailText.view}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl rounded-md" dir={locale === "ar" ? "rtl" : "ltr"}>
                <DialogHeader>
                  <DialogTitle>{detailText.title} {order.orderNumber}</DialogTitle>
                  <DialogDescription>{detailText.description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-3 rounded-md border bg-muted/30 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">{text.table}</p>
                      <p className="mt-1 text-sm font-bold">#{order.tableNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">{typeText.header}</p>
                      <Badge variant="outline" className={orderTypeStyle[order.orderType]}>
                        {orderTypeLabels[order.orderType]}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">{text.status}</p>
                      <Badge variant="outline" className={statusStyle[order.status]}>{order.status}</Badge>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">{detailText.createdAt}</p>
                      <p className="mt-1 text-sm font-bold">{order.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">{text.total}</p>
                      <div className="mt-1 text-sm font-bold"><Price value={order.total} locale={locale} /></div>
                    </div>
                  </div>
                  <div className="grid gap-3 rounded-md border bg-card p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">{typeText.customer}</p>
                      <p className="mt-1 text-sm font-bold">{order.customerName ?? "-"}</p>
                    </div>
                    {order.customerPhone ? (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">{typeText.phone}</p>
                        <p className="mt-1 text-sm font-bold">{order.customerPhone}</p>
                      </div>
                    ) : null}
                    {order.customerAddress ? (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground">{typeText.address}</p>
                        <p className="mt-1 text-sm font-bold">{order.customerAddress}</p>
                      </div>
                    ) : null}
                    {order.customerNotes ? (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold text-muted-foreground">{typeText.notes}</p>
                        <p className="mt-1 text-sm font-bold">{order.customerNotes}</p>
                      </div>
                    ) : null}
                  </div>
                  <div className="overflow-hidden rounded-md border">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-4 border-b p-3 last:border-b-0">
                        <div>
                          <p className="text-sm font-semibold">{item.quantity}x {item.productName}</p>
                          {item.notes ? <p className="mt-1 text-xs text-muted-foreground">{item.notes}</p> : null}
                        </div>
                        <div className="shrink-0 text-sm font-bold">
                          <Price value={item.totalPrice} locale={locale} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between rounded-md border bg-card p-3 text-sm">
                    <span className="font-semibold text-muted-foreground">{detailText.subtotal}</span>
                    <span className="font-bold"><Price value={order.subtotal} locale={locale} /></span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
        { label: text.totalOrders, value: orders.length, icon: ReceiptText },
        { label: text.activeOrders, value: activeOrders.length, icon: Activity },
        { label: text.value, value: <Price value={ordersTotal} locale={locale} />, icon: WalletCards },
        { label: text.items, value: itemsTotal, icon: ShoppingBag },
      ]}
      tableTitle={text.tableTitle}
      tableDescription={text.tableDescription}
      columns={columns}
      data={orders}
      keyExtractor={(order) => order.id}
      searchPlaceholder={controlsText.search}
      searchValue={(order) =>
        `${order.orderNumber} ${order.tableNumber} ${order.status} ${orderTypeLabels[order.orderType]} ${order.customerName ?? ""} ${order.customerPhone ?? ""} ${order.customerAddress ?? ""} ${order.customerNotes ?? ""} ${order.items
          .map((item) => `${item.productName} ${item.notes ?? ""}`)
          .join(" ")}`
      }
      filterLabel={controlsText.filter}
      allFilterLabel={controlsText.all}
      filterGroups={[
        {
          label: text.status,
          allLabel: controlsText.all,
          options: [
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
          ],
        },
        {
          label: typeText.header,
          allLabel: controlsText.all,
          options: [
            {
              label: orderTypeLabels.TABLE,
              value: "TABLE",
              predicate: (order) => order.orderType === "TABLE",
            },
            {
              label: orderTypeLabels.TAKEAWAY,
              value: "TAKEAWAY",
              predicate: (order) => order.orderType === "TAKEAWAY",
            },
            {
              label: orderTypeLabels.DELIVERY,
              value: "DELIVERY",
              predicate: (order) => order.orderType === "DELIVERY",
            },
          ],
        },
      ]}
      emptyMessage={controlsText.noResults}
      emptyDescription={controlsText.noResultsDescription}
    />
  );
}
