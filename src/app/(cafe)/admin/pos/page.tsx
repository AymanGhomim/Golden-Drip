"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { BranchRequired } from "@/components/admin/branch-required";
import { PaymentDialog } from "@/components/admin/payment-dialog";
import { PosCart } from "@/components/features/pos/pos-cart";
import { PosModifierDialog } from "@/components/features/pos/pos-modifier-dialog";
import { PosProductBrowser } from "@/components/features/pos/pos-product-browser";
import { usePosPage } from "@/hooks/use-pos-page";

export default function PosPage() {
  const controller = usePosPage();
  return (
    <AdminShell>
      <BranchRequired>
        <section
          dir="rtl"
          className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5"
        >
          <div className="mb-4">
            <p className="text-xs font-bold text-accent">
              المبيعات · {controller.branch?.name}
            </p>
            <h1 className="mt-1 text-2xl font-black">
              {controller.manualOrder ? "إضافة طلب يدوي" : "نقطة البيع POS"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              الأسعار والتوفر من منيو الفرع الحالي.
            </p>
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <PosProductBrowser
              products={controller.visibleProducts}
              query={controller.query}
              onQueryChange={controller.setQuery}
              onSelect={controller.chooseProduct}
              formatPrice={controller.money}
            />
            <PosCart {...controller} />
          </div>
          <PaymentDialog
            open={controller.paymentOpen}
            total={controller.totals.total}
            currencySymbol={controller.tenant.settings.currencySymbol}
            busy={controller.submitting}
            onOpenChange={controller.setPaymentOpen}
            onConfirm={controller.checkout}
          />
          <PosModifierDialog
            product={controller.selectedProduct}
            groups={controller.modifierGroups}
            selections={controller.modifierSelections}
            formatPrice={controller.money}
            onOpenChange={(open) =>
              !open && controller.setSelectedProduct(null)
            }
            onToggle={controller.toggleModifier}
            onConfirm={controller.confirmModifiers}
          />
        </section>
      </BranchRequired>
    </AdminShell>
  );
}
