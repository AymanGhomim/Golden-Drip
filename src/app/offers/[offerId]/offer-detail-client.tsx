"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BadgePercent, Minus, Plus, ShoppingCart } from "lucide-react";

import { BackButtonRow } from "@/components/shared/back-button-row";
import { OfferPrice } from "@/components/shared/offer-price";
import { SiteHeader } from "@/components/shared/site-header";
import { SocialLinks } from "@/components/shared/social-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/menu-translations";
import { menuCopy } from "@/lib/menu-translations";
import { useCartStore } from "@/store/cart.store";
import type { Offer } from "@/types/offer.types";

export function OfferDetailClient({ offer }: { offer: Offer }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (window.localStorage.getItem("golden-drip-locale") === "ar") setLocale("ar");
    void useCartStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("golden-drip-locale", locale);
  }, [locale]);

  const copy = menuCopy[locale];

  function addOfferToCart() {
    addItem({
      productId: offer.id,
      name: offer.title,
      price: offer.price,
      image: offer.image,
      quantity,
    });
  }

  return (
    <main className="min-h-screen bg-background" dir={locale === "ar" ? "rtl" : "ltr"}>
      <SiteHeader locale={locale} onLocaleChange={setLocale} />
      <BackButtonRow locale={locale} />

      <section className="animate-content-enter mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_22rem] sm:px-6">
        <div className="relative min-h-[26rem] overflow-hidden rounded-md border bg-muted shadow-sm">
          <Image
            src={offer.image}
            alt={offer.title}
            fill
            sizes="(min-width: 1024px) 1152px, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <div className="max-w-2xl space-y-4">
              <Badge className="gap-2 border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/20">
                <BadgePercent className="h-4 w-4" />
                {locale === "ar" ? "عرض خاص" : "Special offer"}
              </Badge>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight drop-shadow-sm sm:text-5xl">
                  {offer.title}
                </h1>
                <p className="max-w-xl text-base leading-8 text-white/90 drop-shadow-sm sm:text-lg">
                  {offer.description}
                </p>
                <OfferPrice
                  originalPrice={offer.originalPrice}
                  price={offer.price}
                  locale={locale}
                  variant="light"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="h-fit space-y-4 rounded-md border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{copy.quantity}</span>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-6 text-center text-lg font-bold">{quantity}</span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setQuantity((value) => value + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            type="button"
            size="lg"
            className="w-full gap-2 rounded-md bg-[#21100a] font-bold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#21100a]/90 dark:bg-[hsl(30_33%_84%)] dark:text-[#21100a] dark:hover:bg-[hsl(30_33%_84%)]"
            onClick={addOfferToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            {copy.addToCart}
          </Button>
        </div>
        <SocialLinks locale={locale} className="lg:col-span-2" />
      </section>
    </main>
  );
}
