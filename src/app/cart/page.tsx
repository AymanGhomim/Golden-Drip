"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Banknote, CreditCard, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

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
        {items.length === 0 ? (
          <Card className="overflow-hidden rounded-md border-[#21100a]/20 bg-card shadow-sm">
            <CardContent className="flex flex-col items-center px-5 py-12 text-center sm:px-8 sm:py-14">
              <div className="mb-6 h-28 w-28">
                <svg
                  viewBox="0 0 420 320"
                  role="img"
                  aria-label={text.empty}
                  className="h-full w-full"
                >
                  <defs>
                    <linearGradient id="cartSteam" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--background))" />
                      <stop offset="100%" stopColor="#c78332" />
                    </linearGradient>
                    <linearGradient id="cartCup" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--background))" />
                      <stop offset="100%" stopColor="hsl(var(--background))" />
                    </linearGradient>
                    <filter id="cartShadow" x="-20%" y="-20%" width="140%" height="160%">
                      <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#000000" floodOpacity="0.28" />
                    </filter>
                  </defs>
                  <path d="M35 248 C90 220 115 258 168 235 C218 214 241 218 292 239 C335 257 361 238 391 218 L391 320 L35 320 Z" fill="hsl(var(--background))" />
                  <circle cx="332" cy="72" r="38" fill="#21100a" opacity="0.08" />
                  <circle cx="84" cy="88" r="20" fill="#21100a" opacity="0.08" />
                  <path d="M132 122 C125 94 153 86 145 58" stroke="url(#cartSteam)" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.85" />
                  <path d="M183 116 C172 83 208 75 196 42" stroke="url(#cartSteam)" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.65" />
                  <path d="M238 122 C229 96 260 86 251 58" stroke="url(#cartSteam)" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.8" />
                  <g filter="url(#cartShadow)">
                    <path d="M112 137 H275 L254 251 H135 Z" fill="url(#cartCup)" />
                    <path d="M277 160 H302 C326 160 333 196 309 209 L267 232" fill="none" stroke="hsl(var(--background))" strokeWidth="18" strokeLinecap="round" />
                    <path d="M126 157 H263 L257 189 H132 Z" fill="#21100a" opacity="0.9" />
                    <path d="M143 251 H246" stroke="#21100a" strokeWidth="14" strokeLinecap="round" opacity="0.55" />
                  </g>
                  <g transform="translate(74 244)">
                    <circle cx="32" cy="32" r="22" fill="hsl(var(--background))" />
                    <circle cx="242" cy="32" r="22" fill="hsl(var(--background))" />
                    <path d="M20 0 H259" stroke="hsl(var(--background))" strokeWidth="14" strokeLinecap="round" />
                    <path d="M0 -54 H46 L70 0" stroke="hsl(var(--background))" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                  <path d="M316 143 L337 164 L379 119" stroke="hsl(var(--background))" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <div className="mb-6 space-y-3">
                <div className="mx-auto w-fit rounded-full border bg-muted px-3 py-1 text-[0.7rem] font-black uppercase tracking-[0.12em] text-muted-foreground">
                  {text.items}: 0
                </div>
                <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{text.empty}</h2>
                <p className="mx-auto max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
                  {text.emptyText}
                </p>
              </div>
              <Button asChild className="inline-flex h-11 w-auto rounded-full bg-primary p-0 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 dark:bg-[hsl(var(--background))] dark:text-[#21100a] dark:hover:bg-[hsl(var(--background))]">
                <Link href="/menu" className="inline-flex h-full items-center justify-center whitespace-nowrap px-6">
                  {text.browse}
                </Link>
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

            <Card className="h-fit overflow-hidden rounded-md shadow-sm dark:border-[#21100a] dark:bg-[#21100a] dark:text-[hsl(30_33%_84%)] dark:shadow-[0_22px_60px_rgba(33,16,10,0.2)] lg:sticky lg:top-24">
              <CardContent className="space-y-5 p-5">
                <div>
                  <h2 className="text-lg font-black">{text.summary}</h2>
                  <p className="mt-1 text-xs text-muted-foreground dark:text-[hsl(30_33%_84%)]">
                    {text.items}: {totalItems}
                  </p>
                </div>
                <div className="space-y-3 rounded-md border bg-background/60 p-4 dark:border-white/10 dark:bg-white/8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground dark:text-[hsl(30_33%_84%)]">{text.subtotal}</span>
                    <Price value={total} locale={locale} currencyClassName="dark:text-[hsl(30_33%_84%)]" />
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 text-lg font-black dark:border-white/10">
                    <span>{text.total}</span>
                    <Price value={total} locale={locale} className="text-xl" currencyClassName="dark:text-[hsl(30_33%_84%)]" />
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
