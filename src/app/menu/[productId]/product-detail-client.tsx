"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Coffee, Minus, Plus, ShoppingCart, Sparkles } from "lucide-react";

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
        <div className="overflow-hidden rounded-md border bg-card shadow-sm lg:grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-image-enter relative min-h-[25rem] overflow-hidden bg-muted sm:min-h-[32rem]">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#32170d] via-[#6f513c] to-[#b49a80] text-white">
              <Coffee className="h-12 w-12 text-white/80" />
              <span className="max-w-48 text-center text-sm font-bold leading-6 text-white/85">
                {text.name}
              </span>
            </div>
            {product.image && !imageFailed ? (
              <Image
                src={product.image}
                alt={text.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="relative z-0 object-cover"
                priority
                onError={() => setImageFailed(true)}
              />
            ) : null}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/82 via-black/24 to-black/0 lg:bg-gradient-to-r lg:from-transparent lg:via-black/0 lg:to-black/28" />
            <div className="absolute bottom-4 left-4 right-4 z-20 text-white lg:hidden">
              <p className="mb-2 w-fit rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[0.68rem] font-bold backdrop-blur-md">
                {categoryName}
              </p>
              <div className="space-y-3 rounded-md border border-white/18 bg-black/18 p-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-sm">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="line-clamp-2 text-2xl font-black leading-tight drop-shadow-sm">
                    {text.name}
                  </h1>
                  <Price
                    value={product.price}
                    locale={locale}
                    className="shrink-0 rounded-full border border-white/35 bg-white/18 px-2.5 py-1 text-sm font-black text-white shadow-[0_10px_24px_rgba(0,0,0,0.2)] backdrop-blur-md"
                    currencyClassName="text-white/75"
                  />
                </div>
                <p className="line-clamp-3 text-xs leading-6 text-white/88">
                  {text.description}
                </p>
              </div>
            </div>
          </div>

          <div className="-mt-8 rounded-t-[1.6rem] bg-card p-4 shadow-[0_-18px_40px_rgba(0,0,0,0.18)] lg:mt-0 lg:rounded-none lg:p-8 lg:shadow-none">
            <div className="space-y-5 lg:space-y-7">
              <div className="hidden space-y-3 lg:block">
                <p className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  {categoryName}
                </p>
                <h1 className="text-4xl font-black tracking-tight">{text.name}</h1>
              </div>

              <div className="space-y-3">
                <p className="hidden text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8 lg:block">
                  {text.description}
                </p>
                <div className="hidden lg:block">
                  <Price value={product.price} locale={locale} className="text-3xl font-black" />
                </div>
              </div>

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
