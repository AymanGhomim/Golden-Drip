import { Boxes, CreditCard, ShoppingCart, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { orderSourceLabels } from "@shared/presentation/order";
import {
  Empty,
  Metric,
  Page,
  PageTitle,
  Panel,
  PrimaryLink,
} from "@/components/shared/PageLayout";
import { formatMoney } from "@/features/orders/order-presentation";
import { useAppSelector } from "@/store";

export function DashboardPage() {
  const orders = useAppSelector((state) => state.orders.items);
  const snapshot = useAppSelector((state) => state.development);
  const session = useAppSelector((state) => state.auth.session);
  const can = (permission: string) =>
    session?.permissions.includes(permission as never) ?? false;
  const sourceData = Object.keys(orderSourceLabels).map((source) => ({
    source: source as keyof typeof orderSourceLabels,
    count: orders.filter((order) => (order.source ?? "MANUAL") === source)
      .length,
  }));
  const maxSource = Math.max(1, ...sourceData.map((item) => item.count));

  return (
    <Page>
      <PageTitle
        eyebrow="مركز التحكم"
        title="لوحة التحكم"
        description={`مرحبًا ${session?.employee.name ?? ""}. تظهر هنا البيانات والإجراءات المسموحة لدورك فقط.`}
      >
        {can("pos.use") ? (
          <PrimaryLink to="/pos">
            <ShoppingCart className="h-4 w-4" />
            فتح نقطة البيع
          </PrimaryLink>
        ) : null}
      </PageTitle>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {can("payments.view") ? (
          <Metric
            label="مبيعات اليوم"
            value={formatMoney(
              orders.reduce((sum, order) => sum + order.total, 0),
            )}
            icon={CreditCard}
          />
        ) : null}
        {can("orders.view") ? (
          <Metric
            label="عدد الطلبات"
            value={String(orders.length)}
            icon={ShoppingCart}
          />
        ) : null}
        {can("inventory.view") ? (
          <Metric
            label="عناصر المخزون"
            value={String(snapshot.inventory.length)}
            icon={Boxes}
          />
        ) : null}
        {can("employees.view") ? (
          <Metric
            label="الموظفون النشطون"
            value={String(
              snapshot.employees.filter(
                (employee) => employee.status === "ACTIVE",
              ).length,
            )}
            icon={Users}
          />
        ) : null}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {can("reports.view") && can("orders.view") ? (
          <Panel title="مصادر الطلبات">
            <div className="space-y-5 py-3">
              {sourceData.map((item) => (
                <div key={item.source}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{orderSourceLabels[item.source]}</span>
                    <b>{item.count}</b>
                  </div>
                  <div className="h-3 rounded-full bg-black/5">
                    <div
                      className="h-3 rounded-full bg-[var(--brand-primary)]"
                      style={{ width: `${(item.count / maxSource) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}
        {can("orders.view") ? (
          <Panel title="أحدث الطلبات">
            {orders.slice(0, 6).map((order) => (
              <Link
                to={`/orders/${order.id}`}
                key={order.id}
                className="flex items-center justify-between border-b border-[var(--brand-border)] py-3 text-sm last:border-0"
              >
                <span className="font-bold">{order.orderNumber}</span>
                <span>{formatMoney(order.total)}</span>
              </Link>
            ))}
            {!orders.length ? (
              <Empty>لا توجد طلبات في الفرع الحالي.</Empty>
            ) : null}
          </Panel>
        ) : null}
        {can("kitchen.view") ? (
          <Panel title="حالة المطبخ">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                ["جديد", "NEW"],
                ["قيد التحضير", "PREPARING"],
                ["جاهز", "READY"],
              ].map(([label, status]) => (
                <div key={status} className="rounded-xl bg-black/5 p-4">
                  <p className="text-2xl font-black">
                    {orders.filter((order) => order.status === status).length}
                  </p>
                  <p className="mt-1 text-xs text-[var(--brand-muted)]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}
      </div>
    </Page>
  );
}
