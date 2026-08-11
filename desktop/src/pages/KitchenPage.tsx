import { Bell, Check, ChefHat, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import {
  KitchenBoard,
  type KitchenStage,
} from "@/components/features/kitchen/KitchenBoard";
import {
  Metric,
  Page,
  PageTitle,
  SecondaryButton,
} from "@/components/shared/PageLayout";
import { useAppDispatch, useAppSelector } from "@/store";
import { orderStatusChanged } from "@/store/orders-slice";

const kitchenStages: KitchenStage[] = [
  { status: "NEW", title: "جديد", action: "بدء التحضير", next: "PREPARING" },
  {
    status: "PREPARING",
    title: "جاري التحضير",
    action: "تحديد كجاهز",
    next: "READY",
  },
  { status: "READY", title: "جاهز", action: "إكمال", next: "COMPLETED" },
];

export function KitchenPage() {
  const orders = useAppSelector((state) =>
    state.orders.items.filter(
      (order) => !["COMPLETED", "CANCELLED", "REFUNDED"].includes(order.status),
    ),
  );
  const session = useAppSelector((state) => state.auth.session);
  const dispatch = useAppDispatch();
  const [soundOn, setSoundOn] = useState(true);
  return (
    <Page>
      <PageTitle
        eyebrow="المبيعات"
        title="المطبخ KDS"
        description="طلبات المستأجر الحالي فقط."
      >
        <SecondaryButton onClick={() => setSoundOn((value) => !value)}>
          {soundOn ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
          التنبيهات {soundOn ? "مفعلة" : "متوقفة"}
        </SecondaryButton>
      </PageTitle>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Metric
          label="جديد"
          value={String(
            orders.filter((order) => order.status === "NEW").length,
          )}
          icon={Bell}
        />
        <Metric
          label="جاري التحضير"
          value={String(
            orders.filter((order) => order.status === "PREPARING").length,
          )}
          icon={ChefHat}
        />
        <Metric
          label="جاهز"
          value={String(
            orders.filter((order) => order.status === "READY").length,
          )}
          icon={Check}
        />
      </div>
      <KitchenBoard
        orders={orders}
        stages={kitchenStages}
        canUpdate={session?.permissions.includes("kitchen.update") ?? false}
        onAdvance={(order, status) =>
          dispatch(orderStatusChanged({ id: order.id, status }))
        }
      />
    </Page>
  );
}
