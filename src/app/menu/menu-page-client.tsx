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
import { OfferPrice } from "@/components/shared/offer-price";
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
      setActiveOfferIndex((index) => (index + 1) % activeOffers.length);
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [activeOffers.length]);

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
    if (dragOffset > threshold) {
      setActiveOfferIndex((index) => (index === 0 ? activeOffers.length - 1 : index - 1));
    } else if (dragOffset < -threshold) {
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
              if (Math.abs(nextOffset) > 8) didDrag.current = true;
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
                  className="group relative block min-h-56 w-full shrink-0 overflow-hidden rounded-md border bg-muted text-start shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_22px_55px_hsl(var(--foreground)/0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-64"
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
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute -left-1/3 top-0 h-full w-1/3 skew-x-[-18deg] bg-white/15 blur-md transition-transform duration-700 ease-out group-hover:translate-x-[420%]" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                    <div className="max-w-2xl space-y-3 transition-transform duration-500 ease-out group-hover:-translate-y-1">
                      <Badge className="border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/20">
                        {locale === "ar" ? "عرض خاص" : "Special offer"}
                      </Badge>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight drop-shadow-sm sm:text-4xl">
                          {offer.title}
                        </h2>
                        <p className="max-w-xl text-sm leading-7 text-white/90 drop-shadow-sm sm:text-base">
                          {offer.description}
                        </p>
                        <OfferPrice
                          originalPrice={offer.originalPrice}
                          price={offer.price}
                          locale={locale}
                          variant="light"
                          className="pt-1"
                        />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {activeOffers.length > 1 ? (
              <div className="absolute bottom-4 right-4 flex gap-2" dir="ltr">
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

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const quantity = quantitiesByProduct.get(product.id) ?? 0;
            const translatedProductText = translatedProduct(product.id, locale);

            return (
              <Card
                key={product.id}
                className="menu-card group cursor-pointer overflow-hidden rounded-md border bg-card/95 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/60 hover:shadow-[0_20px_45px_hsl(var(--foreground)/0.18)]"
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/menu/${product.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    router.push(`/menu/${product.id}`);
                  }
                }}
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={translatedProductText.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ShoppingBag className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute -left-1/2 top-0 h-full w-1/2 skew-x-[-18deg] bg-white/12 blur-md transition-transform duration-700 ease-out group-hover:translate-x-[330%]" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
                  <Price
                    value={product.price}
                    locale={locale}
                    className="absolute right-3 top-3 rounded-full border border-white/25 bg-white/20 px-3 py-1.5 text-sm font-bold text-white shadow-sm backdrop-blur-md"
                    currencyClassName="text-white/75"
                  />
                  {quantity > 0 ? (
                    <Badge className="absolute left-3 top-3 gap-1 rounded-full bg-accent px-3 py-1.5 text-accent-foreground shadow-sm">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {quantity}
                    </Badge>
                  ) : null}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h2 className="line-clamp-2 text-xl font-bold leading-snug text-white drop-shadow-sm transition-transform duration-500 ease-out group-hover:-translate-y-1">
                      {translatedProductText.name}
                    </h2>
                  </div>
                </div>
                <CardContent className="flex flex-col gap-3 p-4">
                  <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
                    {translatedProductText.description}
                  </p>

                  <div>
                    {quantity > 0 ? (
                      <div
                        className="flex h-11 items-center justify-between overflow-hidden rounded-md border border-accent/30 bg-accent/10"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-11 w-12 rounded-none hover:bg-accent hover:text-accent-foreground"
                          onClick={() => decreaseQuantity(product.id)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-12 text-center text-base font-bold">{quantity}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-11 w-12 rounded-none hover:bg-accent hover:text-accent-foreground"
                          onClick={() => increaseQuantity(product.id)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        className="h-11 w-full gap-2 shadow-sm transition-all duration-300 group-hover:shadow-md active:scale-[0.99]"
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
                        <Plus className="h-4 w-4" />
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
      variant={isSelected ? "default" : "outline"}
      className={cn("h-10 shrink-0 px-4", isSelected && "shadow-sm")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
