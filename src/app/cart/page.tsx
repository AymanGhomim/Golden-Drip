"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Banknote, CreditCard, Minus, Plus, ReceiptText, ShoppingBag, Trash2 } from "lucide-react";

import { BackButtonRow } from "@/components/shared/back-button-row";
import { Price } from "@/components/shared/price";
import { SiteHeader } from "@/components/shared/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/lib/menu-translations";
import { useCartStore } from "@/store/cart.store";

const copy = {
  en: {
    title: "Your cart",
    subtitle: "Review your drinks and offers before sending the order.",
    empty: "Your cart is empty",
    emptyText: "Add a drink or offer from the menu to see it here.",
    browse: "Browse menu",
    payment: "Payment method",
    total: "Total",
    subtotal: "Subtotal",
    items: "Items",
    checkout: "Place order",
    remove: "Remove",
    cash: "Cash",
    instapay: "InstaPay",
    summary: "Order summary",
  },
  ar: {
    title: "سلة الطلبات",
    subtitle: "راجع المشروبات والعروض قبل إرسال الطلب.",
    empty: "السلة فارغة",
    emptyText: "أضف مشروب أو عرض من المنيو وسيظهر هنا.",
    browse: "تصفح المنيو",
    payment: "طريقة الدفع",
    total: "الإجمالي",
    subtotal: "قيمة المنتجات",
    items: "العناصر",
    checkout: "إرسال الطلب",
    remove: "حذف",
    cash: "كاش",
    instapay: "إنستا باي",
    summary: "ملخص الطلب",
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
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-background" dir={locale === "ar" ? "rtl" : "ltr"}>
      <SiteHeader locale={locale} onLocaleChange={setLocale} />
      <BackButtonRow locale={locale} />

      <section className="animate-content-enter mx-auto w-full max-w-6xl px-4 pb-28 pt-3 sm:px-6 sm:py-8">
        <div className="mb-5 overflow-hidden rounded-md border border-[#3d2014] bg-[#21100a] text-[#fff5ee] shadow-[0_22px_60px_rgba(33,16,10,0.22)]">
          <div className="relative p-5 sm:p-7">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-[#d6a15c] to-accent" />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="mb-2 w-fit rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.68rem] font-bold text-[#f5ddc9] backdrop-blur">
                {text.items}: {totalItems}
              </p>
                <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{text.title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#d8c0ad] sm:text-base">
                {text.subtitle}
              </p>
              </div>
              <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/10 text-accent sm:flex">
                <ReceiptText className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="overflow-hidden rounded-md">
            <CardContent className="flex flex-col items-center px-5 py-16 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-black">{text.empty}</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{text.emptyText}</p>
              <Button asChild className="mt-6 h-11 rounded-md px-5 font-bold">
                <Link href="/menu">{text.browse}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
            <div className="overflow-hidden rounded-md border bg-card shadow-sm">
              <div className="border-b bg-muted/35 px-4 py-3">
                <h2 className="text-sm font-black">{text.items}</h2>
              </div>
              <div className="divide-y">
              {items.map((item) => (
                <div key={item.productId} className="group grid grid-cols-[5.75rem_1fr] gap-3 p-3 transition-colors hover:bg-muted/25 sm:grid-cols-[8rem_1fr] sm:gap-4 sm:p-4">
                    <div className="relative h-24 overflow-hidden rounded-md bg-muted shadow-sm sm:h-32">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="128px" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <ShoppingBag className="h-7 w-7" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 self-center">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="line-clamp-2 text-base font-black leading-5 sm:text-lg">{item.name}</h2>
                          <Price value={item.price} locale={locale} className="mt-1 text-xs text-muted-foreground" />
                        </div>
                        <Price
                          value={item.price * item.quantity}
                          locale={locale}
                          className="shrink-0 rounded-full border bg-background px-2.5 py-1 text-xs font-black text-foreground shadow-sm"
                        />
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex h-10 items-center overflow-hidden rounded-md border border-accent/30 bg-accent/8 shadow-inner">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 rounded-none transition-colors hover:bg-accent hover:text-accent-foreground"
                            onClick={() => decreaseQuantity(item.productId)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="min-w-10 text-center text-sm font-black">{item.quantity}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 rounded-none transition-colors hover:bg-accent hover:text-accent-foreground"
                            onClick={() => increaseQuantity(item.productId)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 gap-1 px-2 text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {text.remove}
                        </Button>
                      </div>
                    </div>
                </div>
              ))}
              </div>
            </div>

            <Card className="h-fit overflow-hidden rounded-md border-[#3d2014] bg-[#21100a] text-[#fff5ee] shadow-[0_22px_60px_rgba(33,16,10,0.2)] lg:sticky lg:top-24">
              <CardContent className="space-y-5 p-5">
                <div>
                  <h2 className="text-lg font-black">{text.summary}</h2>
                  <p className="mt-1 text-xs text-[#cdb5a5]">
                    {text.items}: {totalItems}
                  </p>
                </div>
                <div className="space-y-3 rounded-md border border-white/10 bg-white/8 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#cdb5a5]">{text.subtotal}</span>
                    <Price value={total} locale={locale} currencyClassName="text-[#cdb5a5]" />
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-3 text-lg font-black">
                    <span>{text.total}</span>
                    <Price value={total} locale={locale} className="text-xl" currencyClassName="text-[#cdb5a5]" />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold">{text.payment}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={paymentMethod === "cash" ? "default" : "outline"}
                      className="h-11 gap-2 rounded-md text-xs font-bold"
                      onClick={() => setPaymentMethod("cash")}
                    >
                      <Banknote className="h-4 w-4" />
                      {text.cash}
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === "instapay" ? "default" : "outline"}
                      className="h-11 gap-2 rounded-md text-xs font-bold"
                      onClick={() => setPaymentMethod("instapay")}
                    >
                      <CreditCard className="h-4 w-4" />
                      {text.instapay}
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  className="h-12 w-full rounded-md bg-accent font-bold text-accent-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent/90"
                >
                  {text.checkout}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </main>
  );
}
