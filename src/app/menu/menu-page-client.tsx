"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Price } from "@/components/shared/price";
import { SiteHeader } from "@/components/shared/site-header";
import { cn } from "@/lib/utils";
import {
  menuCopy,
  translatedCategoryName,
  translatedProduct,
  type Locale,
} from "@/lib/menu-translations";
import { mockCategories } from "@/mocks/categories.mock";
import { mockOffers } from "@/mocks/offers.mock";
import { mockProducts } from "@/mocks/products.mock";
import { useCartStore } from "@/store/cart.store";

const allCategoryId = "all";

export function MenuPageClient() {
  const [selectedCategory, setSelectedCategory] = useState(allCategoryId);
  const [locale, setLocale] = useState<Locale>("en");
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const didDrag = useRef(false);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    void Promise.resolve(useCartStore.persist.rehydrate()).then(() => {
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("golden-drip-locale");
    if (savedLocale === "ar") setLocale("ar");
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("golden-drip-locale", locale);
  }, [locale]);

  const categories = useMemo(
    () =>
      mockCategories
        .filter((category) => category.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    []
  );

  const activeOffers = useMemo(() => {
    return mockOffers
      .filter((offer) => offer.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, []);

  useEffect(() => {
    if (activeOffers.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setActiveOfferIndex((index) => {
        if (locale === "ar") {
          return index === 0 ? activeOffers.length - 1 : index - 1;
        }

        return (index + 1) % activeOffers.length;
      });
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [activeOffers.length, locale]);

  const products = useMemo(() => {
    return mockProducts.filter((product) => {
      return (
        product.isAvailable &&
        (selectedCategory === allCategoryId || product.categoryId === selectedCategory)
      );
    });
  }, [selectedCategory]);

  const quantitiesByProduct = useMemo(() => {
    if (!isHydrated) return new Map<string, number>();
    return new Map(items.map((item) => [item.productId, item.quantity]));
  }, [isHydrated, items]);

  const copy = menuCopy[locale];
  const featuredOffer = activeOffers[activeOfferIndex];

  function finishOfferDrag() {
    if (!isDragging) return;

    const threshold = 60;
    const directionalOffset = locale === "ar" ? -dragOffset : dragOffset;

    if (directionalOffset > threshold) {
      setActiveOfferIndex((index) => (index === 0 ? activeOffers.length - 1 : index - 1));
    } else if (directionalOffset < -threshold) {
      setActiveOfferIndex((index) => (index + 1) % activeOffers.length);
    }

    setIsDragging(false);
    setDragOffset(0);
  }

  return (
    <main className="min-h-screen bg-background pb-28" dir={locale === "ar" ? "rtl" : "ltr"}>
      <SiteHeader locale={locale} onLocaleChange={setLocale} />

      <section className="animate-content-enter mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {featuredOffer ? (
          <div
            className="relative mb-6 touch-pan-y overflow-hidden rounded-md"
            dir="ltr"
            onPointerDown={(event) => {
              if (activeOffers.length <= 1) return;
              dragStartX.current = event.clientX;
              didDrag.current = false;
              setIsDragging(true);
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!isDragging) return;
              const nextOffset = event.clientX - dragStartX.current;
              if (Math.abs(nextOffset) > 24) didDrag.current = true;
              setDragOffset(Math.max(-120, Math.min(120, nextOffset)));
            }}
            onPointerUp={finishOfferDrag}
            onPointerCancel={finishOfferDrag}
          >
            <div
              className={cn(
                "flex ease-out",
                isDragging ? "transition-none" : "transition-transform duration-500"
              )}
              style={{
                transform: `translateX(calc(-${activeOfferIndex * 100}% + ${dragOffset}px))`,
              }}
            >
              {activeOffers.map((offer, index) => (
                <button
                  key={offer.id}
                  type="button"
                  className="group relative block min-h-[17rem] w-full shrink-0 overflow-hidden rounded-md border bg-muted text-start shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_22px_55px_hsl(var(--foreground)/0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-64"
                  onClick={() => {
                    if (didDrag.current) return;
                    router.push(`/offers/${offer.id}`);
                  }}
                >
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    sizes="(min-width: 1024px) 1152px, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/15" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7" dir={locale === "ar" ? "rtl" : "ltr"}>
                    <div className="max-w-[44rem] space-y-3.5 transition-transform duration-500 ease-out group-hover:-translate-y-1 sm:space-y-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="w-fit border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/20">
                          {locale === "ar" ? "عرض خاص" : "Special offer"}
                        </Badge>
                      </div>
                      <div className="space-y-2.5 sm:space-y-3.5">
                        <h2 className="line-clamp-2 text-3xl font-black leading-[1.05] tracking-normal drop-shadow-sm sm:text-5xl">
                          {offer.title}
                        </h2>
                        <p className="line-clamp-2 max-w-2xl text-sm leading-6 text-white/85 drop-shadow-sm sm:text-base sm:leading-7">
                          {offer.description}
                        </p>
                        <div className="flex flex-wrap items-end gap-3 pt-1 sm:gap-4">
                          <Price
                            value={offer.price}
                            locale={locale}
                            className="text-4xl font-black leading-none text-white drop-shadow-sm sm:text-6xl"
                            currencyClassName="text-base font-bold text-white/85 sm:text-xl"
                          />
                          <Price
                            value={offer.originalPrice}
                            locale={locale}
                            className="pb-1 text-sm font-bold text-white/50 line-through sm:text-lg"
                            currencyClassName="text-xs text-white/45 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {activeOffers.length > 1 ? (
              <div
                className={cn(
                  "absolute bottom-4 flex gap-2",
                  locale === "ar" ? "left-4" : "right-4"
                )}
                dir="ltr"
              >
                {activeOffers.map((offer, index) => (
                  <button
                    key={offer.id}
                    type="button"
                    className={cn(
                      "h-2 rounded-full bg-white/50 transition-all",
                      index === activeOfferIndex ? "w-6 bg-white" : "w-2"
                    )}
                    onClick={() => setActiveOfferIndex(index)}
                    aria-label={`Show offer ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="relative mb-6">
          <div className="scrollbar-hidden flex gap-3 overflow-x-auto pb-2 pr-10">
            <CategoryButton
              isSelected={selectedCategory === allCategoryId}
              onClick={() => setSelectedCategory(allCategoryId)}
            >
              {copy.all}
            </CategoryButton>
            {categories.map((category) => (
              <CategoryButton
                key={category.id}
                isSelected={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              >
                {translatedCategoryName(category.id, locale)}
              </CategoryButton>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {products.map((product) => {
            const quantity = quantitiesByProduct.get(product.id) ?? 0;
            const translatedProductText = translatedProduct(product.id, locale);
            const originalPrice = "originalPrice" in product && typeof product.originalPrice === "number"
              ? product.originalPrice
              : undefined;

            return (
              <Card
                key={product.id}
                className="menu-card group cursor-pointer overflow-hidden rounded-md border border-border/70 bg-card shadow-[0_10px_28px_hsl(var(--foreground)/0.07)] transition-[border-color,box-shadow,transform] duration-500 ease-out hover:-translate-y-1.5 hover:border-accent/45 hover:shadow-[0_20px_46px_hsl(var(--foreground)/0.13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/menu/${product.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    router.push(`/menu/${product.id}`);
                  }
                }}
              >
                <div className="relative aspect-[1.35/1] overflow-hidden bg-muted sm:aspect-[1.55/1]">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={translatedProductText.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ShoppingBag className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/64 via-black/12 to-black/5 transition-colors duration-500 group-hover:from-black/58 group-hover:via-black/8" />
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-accent/8" />
                  </div>
                  {quantity > 0 ? (
                    <Badge className="absolute left-2 top-2 gap-1 rounded-full border border-white/25 bg-accent px-2 py-1 text-[0.68rem] font-bold text-accent-foreground shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1.5">
                      <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      {quantity}
                    </Badge>
                  ) : null}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <p className="mb-1 hidden w-fit rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[0.65rem] font-semibold text-white/90 backdrop-blur-sm sm:block">
                      {translatedCategoryName(product.categoryId, locale)}
                    </p>
                  </div>
                </div>
                <CardContent className="flex flex-1 flex-col gap-3 border-t bg-gradient-to-b from-card to-muted/25 p-3.5 transition-colors duration-500 group-hover:from-card group-hover:to-accent/8 sm:gap-4 sm:p-5">
                  <div className="space-y-1.5">
                    <h2 className="line-clamp-2 text-sm font-black leading-snug text-foreground transition-colors duration-300 group-hover:text-foreground sm:text-xl">
                      {translatedProductText.name}
                    </h2>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <Price
                        value={product.price}
                        locale={locale}
                        className="text-base font-black text-foreground sm:text-lg"
                        currencyClassName="text-xs font-bold text-muted-foreground sm:text-sm"
                      />
                      {originalPrice && originalPrice > product.price ? (
                        <Price
                          value={originalPrice}
                          locale={locale}
                          className="text-xs font-semibold text-muted-foreground/65 line-through sm:text-sm"
                          currencyClassName="text-[0.68rem] text-muted-foreground/55 sm:text-xs"
                        />
                      ) : null}
                    </div>
                  </div>
                  <p className="min-h-10 line-clamp-2 text-xs leading-5 text-muted-foreground sm:min-h-12 sm:text-sm sm:leading-6">
                    {translatedProductText.description}
                  </p>

                  <div className="mt-auto pt-1">
                    {quantity > 0 ? (
                      <div
                        className="flex h-9 items-center justify-between overflow-hidden rounded-md border border-accent/30 bg-accent/8 shadow-inner transition-colors duration-300 group-hover:border-accent/45 group-hover:bg-accent/12 sm:h-11"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-none transition-colors hover:bg-accent/18 hover:text-foreground sm:h-11 sm:w-12"
                          onClick={() => decreaseQuantity(product.id)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <span className="min-w-8 text-center text-sm font-bold sm:min-w-12 sm:text-base">{quantity}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-none transition-colors hover:bg-accent/18 hover:text-foreground sm:h-11 sm:w-12"
                          onClick={() => increaseQuantity(product.id)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        className="h-12 w-full gap-2 rounded-lg border border-[#21100a]/10 bg-[#21100a] px-3 text-sm font-bold text-primary-foreground shadow-[0_10px_22px_rgba(33,16,10,0.16)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#21100a]/90 hover:text-primary-foreground hover:shadow-[0_16px_30px_rgba(33,16,10,0.24)] active:translate-y-0 active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 dark:border-[hsl(30_33%_84%)]/35 dark:bg-[hsl(30_33%_84%)] dark:text-[#21100a] dark:hover:bg-[hsl(30_33%_84%)] dark:hover:text-[#21100a] dark:hover:shadow-[0_14px_28px_rgba(228,214,201,0.2)]"
                        onClick={(event) => {
                          event.stopPropagation();
                          addItem({
                            productId: product.id,
                            name: translatedProductText.name,
                            price: product.price,
                            image: product.image,
                            quantity: 1,
                          });
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        {copy.add}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function CategoryButton({
  children,
  isSelected,
  onClick,
}: {
  children: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        "h-12 shrink-0 rounded-full border border-border/70 bg-card/70 px-6 text-sm font-bold text-muted-foreground shadow-[0_8px_18px_hsl(var(--foreground)/0.08)] backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-accent/35 hover:bg-accent/10 hover:text-foreground hover:shadow-[0_12px_24px_hsl(var(--foreground)/0.12)]",
        isSelected &&
          "border-[#21100a] bg-[#21100a] text-primary-foreground shadow-[0_12px_26px_rgba(33,16,10,0.22)] hover:bg-[#21100a]/90 hover:text-primary-foreground dark:border-[hsl(30_33%_84%)] dark:bg-[hsl(30_33%_84%)] dark:text-[#21100a] dark:hover:bg-[hsl(30_33%_84%)]"
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
