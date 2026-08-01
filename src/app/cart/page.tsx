"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Banknote, CreditCard, ShoppingBag, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/shared/site-header";
import { BackButtonRow } from "@/components/shared/back-button-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Price } from "@/components/shared/price";
import { QuantityControl } from "@/components/shared/quantity-control";
import { useCartStore } from "@/store/cart.store";
import type { Locale } from "@/lib/menu-translations";

const copy = {
  en: {
    title: "Your cart", back: "Back to menu", empty: "Your cart is empty",
    emptyText: "Add a drink from the menu to see it here.", browse: "Browse menu",
    payment: "Payment method", total: "Total", checkout: "Place order", remove: "Remove", cash: "Cash", instapay: "InstaPay",
  },
  ar: {
    title: "سلة الطلبات", back: "العودة للقائمة", empty: "السلة فارغة",
    emptyText: "أضف مشروبًا من القائمة ليظهر هنا.", browse: "تصفح القائمة",
    payment: "طريقة الدفع", total: "الإجمالي", checkout: "إرسال الطلب", remove: "حذف", cash: "كاش", instapay: "إنستا باي",
  },
} as const;

export default function CartPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "instapay">("cash");
  const items = useCartStore((state) => state.items);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  useEffect(() => {
    if (window.localStorage.getItem("golden-drip-locale") === "ar") setLocale("ar");
    void useCartStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("golden-drip-locale", locale);
  }, [locale]);

  const text = copy[locale];
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="min-h-screen bg-background" dir={locale === "ar" ? "rtl" : "ltr"}>
      <SiteHeader locale={locale} onLocaleChange={setLocale} />
      <BackButtonRow locale={locale} />

      <section className="animate-content-enter mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">{text.title}</h1>
        {items.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"><ShoppingBag className="h-8 w-8 text-muted-foreground" /></div>
            <h2 className="text-xl font-semibold">{text.empty}</h2>
            <p className="mt-2 text-muted-foreground">{text.emptyText}</p>
            <Button asChild className="mt-6"><Link href="/menu">{text.browse}</Link></Button>
          </CardContent></Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.productId} className="overflow-hidden">
                  <CardContent className="flex gap-4 p-4">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.image ? <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="font-semibold">{item.name}</h2>
                        <Price value={item.price * item.quantity} locale={locale} className="shrink-0" />
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <QuantityControl quantity={item.quantity} onIncrease={() => increaseQuantity(item.productId)} onDecrease={() => decreaseQuantity(item.productId)} />
                        <Button type="button" variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive" onClick={() => removeItem(item.productId)}><Trash2 className="h-4 w-4" />{text.remove}</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="h-fit"><CardContent className="space-y-5 p-5">
              <div className="flex items-center justify-between text-lg font-semibold"><span>{text.total}</span><Price value={total} locale={locale} /></div>
              <div className="space-y-3 border-t pt-5">
                <p className="font-semibold">{text.payment}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant={paymentMethod === "cash" ? "default" : "outline"} className="h-11 gap-2" onClick={() => setPaymentMethod("cash")}><Banknote className="h-4 w-4" />{text.cash}</Button>
                  <Button type="button" variant={paymentMethod === "instapay" ? "default" : "outline"} className="h-11 gap-2" onClick={() => setPaymentMethod("instapay")}><CreditCard className="h-4 w-4" />{text.instapay}</Button>
                </div>
              </div>
              <Button type="button" className="w-full">{text.checkout}</Button>
            </CardContent></Card>
          </div>
        )}
      </section>
    </main>
  );
}
