"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Coffee, Minus, Plus, ShoppingCart } from "lucide-react";

import { BackButtonRow } from "@/components/shared/back-button-row";
import { Price } from "@/components/shared/price";
import { SiteHeader } from "@/components/shared/site-header";
import { Button } from "@/components/ui/button";
import {
  menuCopy,
  translatedCategoryName,
  translatedProduct,
  type Locale,
} from "@/lib/menu-translations";
import { useCartStore } from "@/store/cart.store";
import type { Product } from "@/types/product.types";

export function ProductDetailClient({ product }: { product: Product }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [quantity, setQuantity] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);
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

  useEffect(() => {
    setImageFailed(false);
  }, [product.image]);

  const copy = menuCopy[locale];
  const text = translatedProduct(product.id, locale);
  const categoryName = translatedCategoryName(product.categoryId, locale);

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

      <section className="animate-content-enter mx-auto w-full max-w-6xl px-4 pb-28 pt-3 sm:px-6 sm:py-8">
        <div className="space-y-4">
          <div className="animate-image-enter overflow-hidden rounded-md border bg-card shadow-sm">
            <div className="relative bg-muted">
            {product.image && !imageFailed ? (
              <Image
                src={product.image}
                alt={text.name}
                width={1200}
                height={900}
                sizes="(min-width: 1024px) 1152px, 100vw"
                className="h-80 w-full object-cover sm:h-[32rem]"
                priority
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="flex h-80 flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#32170d] via-[#6f513c] to-[#b49a80] text-white sm:h-[32rem]">
                <Coffee className="h-12 w-12 text-white/80" />
                <span className="max-w-48 text-center text-sm font-bold leading-6 text-white/85">
                  {text.name}
                </span>
              </div>
            )}
            </div>
            <div className="space-y-3 p-4 sm:p-5">
              <p className="w-fit rounded-full border bg-muted px-2.5 py-1 text-[0.68rem] font-bold text-muted-foreground">
                {categoryName}
              </p>
              <div className="flex items-start justify-between gap-3">
                  <h1 className="text-2xl font-black leading-tight sm:text-4xl">
                    {text.name}
                  </h1>
                  <Price
                    value={product.price}
                    locale={locale}
                  className="shrink-0 rounded-full border bg-muted px-2.5 py-1 text-sm font-black text-foreground"
                  />
                </div>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                  {text.description}
                </p>
            </div>
          </div>

          <div className="rounded-md border bg-card p-4 shadow-sm sm:p-5">
            <div className="space-y-5">
              <div className="rounded-md border bg-background/60 p-3.5 sm:p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold">{copy.quantity}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    x{quantity}
                  </span>
                </div>
                <div className="flex h-11 items-center justify-between overflow-hidden rounded-md border border-accent/30 bg-accent/8">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-11 w-12 rounded-none hover:bg-accent/15"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-12 text-center text-lg font-black">{quantity}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-11 w-12 rounded-none hover:bg-accent/15"
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
                className="h-12 w-full gap-2 rounded-md bg-[#21100a] font-bold text-[#fff5ee] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#2f170e] dark:bg-[#b9a58f] dark:text-[#1b0d08] dark:hover:bg-[#c7b39d]"
                onClick={addToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                {copy.addToCart}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
