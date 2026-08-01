"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButtonRow } from "@/components/shared/back-button-row";
import { SiteHeader } from "@/components/shared/site-header";
import { Price } from "@/components/shared/price";
import { menuCopy, translatedProduct, type Locale } from "@/lib/menu-translations";
import { useCartStore } from "@/store/cart.store";
import type { Product } from "@/types/product.types";

export function ProductDetailClient({ product }: { product: Product }) {
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
  const text = translatedProduct(product.id, locale);

  function addToCart() {
    addItem({
      productId: product.id,
      name: text.name,
      price: product.price,
      image: product.image,
      quantity,
    });
  }

  return (
    <main className="min-h-screen bg-background" dir={locale === "ar" ? "rtl" : "ltr"}>
      <SiteHeader locale={locale} onLocaleChange={setLocale} />
      <BackButtonRow locale={locale} />

      <section className="animate-content-enter mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2 lg:items-start sm:px-6">
        <div className="animate-image-enter relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-sm">
          {product.image ? <Image src={product.image} alt={text.name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /> : null}
        </div>
        <div className="space-y-7 lg:py-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Golden Drip Café</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{text.name}</h1>
            <p className="max-w-xl text-base leading-8 text-muted-foreground">{text.description}</p>
            <Price value={product.price} locale={locale} className="text-2xl" />
          </div>

          <div className="flex items-center justify-between rounded-xl border bg-card p-4">
            <span className="font-semibold">{copy.quantity}</span>
            <div className="flex items-center gap-4">
              <Button type="button" size="icon" variant="outline" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></Button>
              <span className="min-w-6 text-center text-lg font-bold">{quantity}</span>
              <Button type="button" size="icon" variant="outline" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          <Button type="button" size="lg" className="w-full gap-2" onClick={addToCart}><ShoppingCart className="h-5 w-5" />{copy.addToCart}</Button>
        </div>
      </section>
    </main>
  );
}
