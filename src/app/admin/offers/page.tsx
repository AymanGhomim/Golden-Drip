"use client";

import Image from "next/image";
import { BadgePercent, Eye, EyeOff, ImageIcon, Plus, Trash2, WalletCards } from "lucide-react";
import { useState } from "react";

import { AdminDataPage } from "@/components/admin/admin-data-page";
import { OfferPrice } from "@/components/shared/offer-price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockOffers } from "@/mocks/offers.mock";
import { useAdminLocale } from "@/providers/admin-locale-provider";
import type { Offer } from "@/types/offer.types";

export default function OffersPage() {
  const { locale } = useAdminLocale();
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const activeOffers = offers.filter((offer) => offer.isActive);
  const averagePrice = Math.round(
    offers.reduce((sum, offer) => sum + offer.price, 0) / Math.max(offers.length, 1)
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
    0,
    ...offers.map((offer) => offer.originalPrice - offer.price)
  );
  const formText =
    locale === "en"
      ? {
          title: "Add offer",
          description: "Create a promotional banner that appears in the menu slider.",
          name: "Offer title",
          descriptionLabel: "Description",
          image: "Image URL",
          originalPrice: "Old price",
          currentPrice: "New price",
          cancel: "Cancel",
          save: "Save offer",
        }
      : {
          title: "إضافة عرض",
          description: "أضف بانر عرض يظهر في سلايدر المنيو.",
          name: "عنوان العرض",
          descriptionLabel: "الوصف",
          image: "رابط الصورة",
          originalPrice: "السعر قبل العرض",
          currentPrice: "السعر بعد العرض",
          cancel: "إلغاء",
          save: "حفظ العرض",
        };
  const selectItemClassName = locale === "ar" ? "justify-end pl-2 pr-8 text-right [&>span]:left-auto [&>span]:right-2" : undefined;

  function saveOffer(formData: FormData) {
    const nextOffer: Offer = {
      id: `offer-${Date.now()}`,
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      image: String(formData.get("image") ?? ""),
      originalPrice: Number(formData.get("originalPrice") ?? 0),
      price: Number(formData.get("price") ?? 0),
      sortOrder: Number(formData.get("sortOrder") ?? offers.length + 1),
      isActive: String(formData.get("isActive") ?? "active") === "active",
    };

    setOffers((current) => [nextOffer, ...current]);
    setIsAddDialogOpen(false);
  }

  function toggleOfferStatus(offerId: string) {
    setOffers((current) =>
      current.map((offer) =>
        offer.id === offerId ? { ...offer, isActive: !offer.isActive } : offer
      )
    );
  }

  function deleteOffer(offerId: string) {
    setOffers((current) => current.filter((offer) => offer.id !== offerId));
  }
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
    {
      key: "actions",
      header: locale === "en" ? "Actions" : "الإجراءات",
      headerClassName: "w-[96px] text-center",
      cellClassName: "w-[96px]",
      cell: (offer: Offer) => {
        const StatusIcon = offer.isActive ? EyeOff : Eye;

        return (
          <div className="flex justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 border-amber-300/60 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              onClick={() => toggleOfferStatus(offer.id)}
              aria-label={offer.isActive ? text.hiddenLabel : text.activeLabel}
              title={offer.isActive ? text.hiddenLabel : text.activeLabel}
            >
              <StatusIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => deleteOffer(offer.id)}
              aria-label={locale === "en" ? "Delete" : "حذف"}
              title={locale === "en" ? "Delete" : "حذف"}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminDataPage
      eyebrow={text.eyebrow}
      title={text.title}
      description={text.description}
      actionLabel={text.add}
      actionContent={
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-9 gap-2 rounded-md px-3 text-sm shadow-sm">
              <Plus className="h-4 w-4" />
              {text.add}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[92vh] max-w-2xl overflow-hidden rounded-md p-0" dir={locale === "ar" ? "rtl" : "ltr"}>
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>{formText.title}</DialogTitle>
              <DialogDescription>{formText.description}</DialogDescription>
            </DialogHeader>
            <form
              className="grid max-h-[calc(92vh-6rem)] gap-4 overflow-y-auto px-6 pb-6 pt-2"
              onSubmit={(event) => {
                event.preventDefault();
                saveOffer(new FormData(event.currentTarget));
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="offer-title">{formText.name}</Label>
                  <Input id="offer-title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer-image">{formText.image}</Label>
                  <Input id="offer-image" name="image" type="url" required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="offer-original-price">{formText.originalPrice}</Label>
                  <Input id="offer-original-price" name="originalPrice" type="number" min="0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer-price">{formText.currentPrice}</Label>
                  <Input id="offer-price" name="price" type="number" min="0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer-order">{text.order}</Label>
                  <Input id="offer-order" name="sortOrder" type="number" min="1" defaultValue={offers.length + 1} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="offer-description">{formText.descriptionLabel}</Label>
                <Textarea id="offer-description" name="description" required />
              </div>
              <div className="space-y-2">
                <Label>{text.status}</Label>
                <Select name="isActive" defaultValue="active">
                  <SelectTrigger className={locale === "ar" ? "flex-row-reverse" : undefined}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={locale === "ar" ? "rtl" : "ltr"}>
                    <SelectItem value="active" className={selectItemClassName}>{text.activeLabel}</SelectItem>
                    <SelectItem value="hidden" className={selectItemClassName}>{text.hiddenLabel}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="sticky bottom-0 -mx-6 gap-2 border-t bg-background px-6 py-4 sm:gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {formText.cancel}
                </Button>
                <Button type="submit">{formText.save}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
      stats={[
        { label: text.active, value: activeOffers.length, icon: Eye },
        { label: text.banners, value: offers.length, icon: ImageIcon },
        { label: text.average, value: averagePrice, icon: WalletCards },
        { label: text.discount, value: bestDiscount, icon: BadgePercent },
      ]}
      tableTitle={text.tableTitle}
      tableDescription={text.tableDescription}
      columns={columns}
      data={offers}
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
