"use client";
import { useEffect, useMemo, useState } from "react";
import { Bell, Check, ChefHat, Clock3, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOrdersStore } from "@/store/orders.store";
import type { Order, OrderStatus } from "@/types/order.types";

const stages: Array<{ status: OrderStatus; title: string; action: string }> = [
  { status: "NEW", title: "جديد", action: "بدء التحضير" },
  { status: "PREPARING", title: "جاري التحضير", action: "تحديد كجاهز" },
  { status: "READY", title: "جاهز", action: "إكمال" },
];
export default function KitchenOrdersPage() {
  const orders = useOrdersStore((state) => state.orders).filter(
    (order) => !["COMPLETED", "CANCELLED"].includes(order.status),
  );
  const updateStatus = useOrdersStore((state) => state.updateStatus);
  const [soundOn, setSoundOn] = useState(true);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const reload = () => useOrdersStore.getState().loadForTenant();
    reload();
    window.addEventListener("orders:changed", reload);
    window.addEventListener("tenant:changed", reload);
    window.addEventListener("branch:changed", reload);
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("orders:changed", reload);
      window.removeEventListener("tenant:changed", reload);
      window.removeEventListener("branch:changed", reload);
    };
  }, []);
  const totals = useMemo(
    () => ({
      fresh: orders.filter((order) => order.status === "NEW").length,
      preparing: orders.filter((order) => order.status === "PREPARING").length,
      ready: orders.filter((order) => order.status === "READY").length,
    }),
    [orders],
  );
  const advance = (order: Order) => {
    const next =
      order.status === "NEW"
        ? "PREPARING"
        : order.status === "PREPARING"
          ? "READY"
          : "COMPLETED";
    updateStatus(order.id, next);
    window.dispatchEvent(new Event("orders:changed"));
    toast.success("تم تحديث حالة الطلب");
  };
  return (
    <AdminShell>
      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5"
      >
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold text-accent">المبيعات</p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-black">
              <ChefHat className="h-6 w-6 text-accent" />
              المطبخ KDS
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              طلبات المستأجر الحالي فقط.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSoundOn((value) => !value)}
          >
            {soundOn ? (
              <Volume2 className="ml-2 h-4 w-4" />
            ) : (
              <VolumeX className="ml-2 h-4 w-4" />
            )}
            التنبيهات {soundOn ? "مفعلة" : "متوقفة"}
          </Button>
        </div>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Kpi icon={Bell} label="جديد" value={totals.fresh} />
          <Kpi icon={ChefHat} label="جاري التحضير" value={totals.preparing} />
          <Kpi icon={Check} label="جاهز" value={totals.ready} />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {stages.map((stage) => (
            <div
              key={stage.status}
              className="min-h-[520px] rounded-xl bg-muted/35 p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-black">{stage.title}</h2>
                <Badge variant="outline">
                  {
                    orders.filter((order) => order.status === stage.status)
                      .length
                  }
                </Badge>
              </div>
              <div className="space-y-3">
                {orders
                  .filter((order) => order.status === stage.status)
                  .map((order) => (
                    <KitchenCard
                      key={order.id}
                      order={order}
                      now={now}
                      action={stage.action}
                      onAction={() => advance(order)}
                    />
                  ))}
              </div>
              {!orders.some((order) => order.status === stage.status) ? (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  لا توجد طلبات
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
function Kpi({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bell;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <b className="mt-1 block text-2xl">{value}</b>
        </div>
        <Icon className="h-5 w-5 text-accent" />
      </CardContent>
    </Card>
  );
}
function KitchenCard({
  order,
  now,
  action,
  onAction,
}: {
  order: Order;
  now: number;
  action: string;
  onAction: () => void;
}) {
  const minutes = Math.max(
    1,
    Math.floor((now - new Date(order.createdAt).getTime()) / 60000),
  );
  const late = minutes >= 30 && order.status !== "READY";
  return (
    <Card className={late ? "border-2 border-red-400" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-black">{order.orderNumber}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {order.orderType === "TABLE"
                ? `داخل الكافيه · طاولة ${order.tableNumber}`
                : order.orderType === "TAKEAWAY"
                  ? "تيك أواي"
                  : "توصيل"}
            </p>
          </div>
          <Badge>{late ? "متأخر" : order.status}</Badge>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          منذ {minutes} دقيقة
        </div>
        <div className="my-3 space-y-2 border-y py-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-2 text-sm">
              <span>
                <b>{item.quantity}×</b> {item.productName}
              </span>
              <small>{item.notes}</small>
            </div>
          ))}
        </div>
        <Button className="w-full" onClick={onAction}>
          {action}
        </Button>
      </CardContent>
    </Card>
  );
}
