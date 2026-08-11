"use client";

import { CustomerCartItems } from "@/components/features/customer-cart/customer-cart-items";
import { CustomerCheckoutSummary } from "@/components/features/customer-cart/customer-checkout-summary";
import { CustomerEmptyCart } from "@/components/features/customer-cart/customer-empty-cart";
import { BackButtonRow } from "@/components/shared/back-button-row";
import { SiteHeader } from "@/components/shared/site-header";
import { useCustomerCart } from "@/hooks/use-customer-cart";

export default function CartPage() {
  const cart = useCustomerCart();
  return (
    <main
      className="min-h-screen bg-background"
      dir={cart.locale === "ar" ? "rtl" : "ltr"}
    >
      <SiteHeader locale={cart.locale} onLocaleChange={cart.setLocale} />
      <BackButtonRow locale={cart.locale} />
      <section className="animate-content-enter mx-auto w-full max-w-6xl px-4 pb-28 pt-3 sm:px-6 sm:py-8">
        {cart.items.length === 0 ? (
          <CustomerEmptyCart
            title={cart.text.empty}
            description={cart.text.emptyText}
            itemsLabel={cart.text.items}
            browseLabel={cart.text.browse}
            menuHref={cart.customerRoute.href("/menu")}
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
            <CustomerCartItems {...cart} />
            <CustomerCheckoutSummary {...cart} />
          </div>
        )}
      </section>
    </main>
  );
}
