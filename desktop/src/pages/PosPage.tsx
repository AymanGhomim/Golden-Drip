import { PosCart } from "@/components/features/pos/PosCart";
import { PosProductBrowser } from "@/components/features/pos/PosProductBrowser";
import { Page, PageTitle } from "@/components/shared/PageLayout";
import { usePosCheckout } from "@/hooks/usePosCheckout";

export function PosPage() {
  const checkout = usePosCheckout();
  return (
    <Page>
      <PageTitle
        eyebrow={`المبيعات · ${checkout.session?.currentBranch?.name ?? ""}`}
        title="نقطة البيع POS"
        description="الأسعار والتوفر من منيو الفرع الحالي."
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <PosProductBrowser {...checkout} />
        <PosCart {...checkout} />
      </div>
    </Page>
  );
}
