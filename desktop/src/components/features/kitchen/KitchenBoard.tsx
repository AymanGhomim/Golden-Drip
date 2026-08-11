import { Empty } from "@/components/shared/PageLayout";
import { KitchenOrderCard } from "@/components/features/kitchen/KitchenOrderCard";
import type { DesktopOrder, DesktopOrderStatus } from "@/types";

export type KitchenStage = {
  status: "NEW" | "PREPARING" | "READY";
  title: string;
  action: string;
  next: DesktopOrderStatus;
};

export function KitchenBoard({
  orders,
  stages,
  canUpdate,
  onAdvance,
}: {
  orders: DesktopOrder[];
  stages: KitchenStage[];
  canUpdate: boolean;
  onAdvance: (order: DesktopOrder, next: DesktopOrderStatus) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {stages.map((stage) => {
        const stageOrders = orders.filter(
          (order) =>
            order.status === stage.status ||
            (stage.status === "PREPARING" && order.status === "ACCEPTED"),
        );
        return (
          <section
            key={stage.status}
            className="min-h-[520px] rounded-xl bg-black/5 p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-black">{stage.title}</h2>
              <span className="rounded-full border border-[var(--brand-border)] px-2 py-0.5 text-xs">
                {stageOrders.length}
              </span>
            </div>
            <div className="space-y-3">
              {stageOrders.map((order) => (
                <KitchenOrderCard
                  key={order.id}
                  order={order}
                  action={stage.action}
                  onAction={() =>
                    onAdvance(
                      order,
                      order.status === "ACCEPTED" ? "PREPARING" : stage.next,
                    )
                  }
                  canUpdate={canUpdate}
                />
              ))}
            </div>
            {!stageOrders.length ? <Empty>لا توجد طلبات</Empty> : null}
          </section>
        );
      })}
    </div>
  );
}
