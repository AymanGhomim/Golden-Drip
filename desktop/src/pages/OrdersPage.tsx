import { Download, Plus, RefreshCw } from "lucide-react";
import { OrdersFilters } from "@/components/features/orders/OrdersFilters";
import { OrdersTable } from "@/components/features/orders/OrdersTable";
import {
  Page,
  PageTitle,
  Panel,
  PrimaryLink,
  SecondaryButton,
} from "@/components/shared/PageLayout";
import { useOrderFilters } from "@/hooks/useOrderFilters";

export function OrdersPage() {
  const filters = useOrderFilters();
  return (
    <Page>
      <PageTitle
        eyebrow="المبيعات"
        title="الطلبات"
        description="كل الطلبات في نظام موحد: نقطة البيع وQR والمنيو الإلكتروني والطلب اليدوي."
      >
        <PrimaryLink to="/pos">
          <Plus className="h-4 w-4" />
          إضافة طلب يدوي
        </PrimaryLink>
        <SecondaryButton>
          <RefreshCw className="h-4 w-4" />
          تحديث
        </SecondaryButton>
        <SecondaryButton
          onClick={filters.exportOrders}
          disabled={!filters.filteredOrders.length}
        >
          <Download className="h-4 w-4" />
          تصدير
        </SecondaryButton>
      </PageTitle>
      <Panel className="overflow-hidden p-0" title="">
        <OrdersFilters {...filters} />
        <OrdersTable {...filters} />
      </Panel>
    </Page>
  );
}
