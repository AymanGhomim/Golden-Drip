"use client";

import Image from "next/image";

import { AdminDataPage } from "@/components/admin/admin-data-page";
import { OfferPrice } from "@/components/shared/offer-price";
import { Badge } from "@/components/ui/badge";
import { mockOffers } from "@/mocks/offers.mock";
import { useAdminLocale } from "@/providers/admin-locale-provider";
import type { Offer } from "@/types/offer.types";

export default function OffersPage() {
  const { locale } = useAdminLocale();
  const activeOffers = mockOffers.filter((offer) => offer.isActive);
  const averagePrice = Math.round(
    mockOffers.reduce((sum, offer) => sum + offer.price, 0) / mockOffers.length
  );
  const text =
    locale === "en"
      ? {
          eyebrow: "Golden Drip management",
          title: "Menu offers",
          description: "Manage customer-facing promotional banners and combo offers.",
          add: "Add offer",
          tableTitle: "Offer list",
          tableDescription: "Promotions that appear in the menu slider and can be added to cart.",
          offer: "Offer",
          price: "Price",
          order: "Sort order",
          status: "Status",
          activeLabel: "Active",
          hiddenLabel: "Hidden",
          active: "Active offers",
          banners: "Menu banners",
          average: "Average offer price",
          discount: "Best discount",
        }
      : {
          eyebrow: "إدارة جولدن دريب",
          title: "عروض المنيو",
          description: "إدارة بانرات العروض والكومبو التي تظهر للعميل في المنيو.",
          add: "إضافة عرض",
          tableTitle: "قائمة العروض",
          tableDescription: "العروض التي تظهر في سلايدر المنيو ويمكن إضافتها للسلة.",
          offer: "العرض",
          price: "السعر",
          order: "الترتيب",
          status: "الحالة",
          activeLabel: "نشط",
          hiddenLabel: "مخفي",
          active: "عروض نشطة",
          banners: "بانرات المنيو",
          average: "متوسط سعر العرض",
          discount: "أفضل خصم",
        };

  const bestDiscount = Math.max(
    ...mockOffers.map((offer) => offer.originalPrice - offer.price)
  );
  const controlsText =
    locale === "en"
      ? {
          search: "Search offers",
          all: "All offers",
          filter: "Filter",
          noResults: "No offers found",
          noResultsDescription: "Try another search or filter.",
        }
      : {
          search: "ابحث في العروض",
          all: "كل العروض",
          filter: "تصفية",
          noResults: "لا توجد عروض",
          noResultsDescription: "جرب بحث أو تصفية مختلفة.",
        };

  const columns = [
    {
      key: "offer",
      header: text.offer,
      cell: (offer: Offer) => (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-16 overflow-hidden rounded-md bg-muted">
            <Image src={offer.image} alt={offer.title} fill sizes="64px" className="object-cover" />
          </div>
          <div>
            <p className="font-semibold">{offer.title}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{offer.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: text.price,
      cell: (offer: Offer) => (
        <OfferPrice
          originalPrice={offer.originalPrice}
          price={offer.price}
          locale={locale}
        />
      ),
    },
    { key: "order", header: text.order, cell: (offer: Offer) => offer.sortOrder },
    {
      key: "status",
      header: text.status,
      cell: (offer: Offer) => (
        <Badge variant={offer.isActive ? "default" : "secondary"}>
          {offer.isActive ? text.activeLabel : text.hiddenLabel}
        </Badge>
      ),
    },
  ];

  return (
    <AdminDataPage
      eyebrow={text.eyebrow}
      title={text.title}
      description={text.description}
      actionLabel={text.add}
      stats={[
        { label: text.active, value: activeOffers.length },
        { label: text.banners, value: mockOffers.length },
        { label: text.average, value: averagePrice },
        { label: text.discount, value: bestDiscount },
      ]}
      tableTitle={text.tableTitle}
      tableDescription={text.tableDescription}
      columns={columns}
      data={mockOffers}
      keyExtractor={(offer) => offer.id}
      searchPlaceholder={controlsText.search}
      searchValue={(offer) => `${offer.title} ${offer.description}`}
      filterLabel={controlsText.filter}
      allFilterLabel={controlsText.all}
      filterOptions={[
        {
          label: text.activeLabel,
          value: "active",
          predicate: (offer) => offer.isActive,
        },
        {
          label: text.hiddenLabel,
          value: "hidden",
          predicate: (offer) => !offer.isActive,
        },
      ]}
      emptyMessage={controlsText.noResults}
      emptyDescription={controlsText.noResultsDescription}
    />
  );
}
