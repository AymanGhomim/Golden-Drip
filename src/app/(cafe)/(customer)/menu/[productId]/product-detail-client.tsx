"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Coffee, Minus, Plus, ShoppingCart } from "lucide-react";

import { BackButtonRow } from "@/components/shared/back-button-row";
import { Price } from "@/components/shared/price";
import { SiteHeader } from "@/components/shared/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  menuCopy,
  translatedCategoryName,
  translatedProduct,
  type Locale,
} from "@/lib/menu-translations";
import { useCartStore } from "@/store/cart.store";
import type { Product } from "@/types/product.types";
import { cafeDataService } from "@/services/cafe-data.service";

export function ProductDetailClient({ product }: { product: Product }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [quantity, setQuantity] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);
  const [branchPrice, setBranchPrice] = useState(product.price);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (window.localStorage.getItem("cafe-ui-locale") === "ar") setLocale("ar");
    setBranchPrice(
      cafeDataService.getBranchProducts().find((item) => item.id === product.id)
        ?.price ?? product.price,
    );
    void Promise.resolve();
  }, [product.id, product.price]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("cafe-ui-locale", locale);
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
      price: branchPrice,
      image: product.image,
      quantity,
    });
  }

  return (
    <main
      className="min-h-screen bg-background"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <SiteHeader locale={locale} onLocaleChange={setLocale} />
      <BackButtonRow locale={locale} />

      <section className="animate-content-enter mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_22rem] sm:px-6">
        <div className="animate-image-enter relative min-h-[26rem] overflow-hidden rounded-md border bg-muted shadow-[0_10px_28px_hsl(var(--foreground)/0.07)]">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-primary text-primary-foreground">
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
              sizes="(min-width: 1024px) 1152px, 100vw"
              className="object-cover"
              priority
              onError={() => setImageFailed(true)}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <div className="max-w-2xl space-y-4">
              <Badge className="gap-2 border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/20">
                <Coffee className="h-4 w-4" />
                {categoryName}
              </Badge>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight drop-shadow-sm sm:text-5xl">
                  {text.name}
                </h1>
                <p className="max-w-xl text-base leading-8 text-white/90 drop-shadow-sm sm:text-lg">
                  {text.description}
                </p>
                <Price
                  value={branchPrice}
                  locale={locale}
                  className="w-fit rounded-full border border-white/30 bg-white/18 px-3 py-1.5 text-2xl font-black text-white shadow-[0_8px_18px_rgba(0,0,0,0.12)] backdrop-blur-md"
                  currencyClassName="text-white/75"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-fit space-y-4 rounded-md border bg-card p-5 shadow-[0_10px_28px_hsl(var(--foreground)/0.07)]">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{copy.quantity}</span>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-6 text-center text-lg font-bold">
                {quantity}
              </span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="transition-colors hover:bg-accent hover:text-accent-foreground"
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
            className="w-full gap-2 rounded-md bg-primary font-bold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90"
            onClick={addToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            {copy.addToCart}
          </Button>
        </div>
      </section>
    </main>
  );
}
