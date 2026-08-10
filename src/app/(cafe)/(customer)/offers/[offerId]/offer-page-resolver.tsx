"use client";

import { useEffect, useState } from "react";
import { AppLoadingState, AppNotFoundState } from "@/components/feedback/app-state";
import { cafeDataService } from "@/services/cafe-data.service";
import type { Offer } from "@/types/offer.types";
import { OfferDetailClient } from "./offer-detail-client";

export function OfferPageResolver({ offerId }: { offerId: string }) {
  const [offer, setOffer] = useState<Offer | null | undefined>();

  useEffect(() => {
    const resolve = () =>
      setOffer(
        cafeDataService
          .getOffers()
          .find((item) => item.id === offerId && item.isActive) ?? null,
      );
    resolve();
    window.addEventListener("tenant:changed", resolve);
    return () => window.removeEventListener("tenant:changed", resolve);
  }, [offerId]);

  if (offer === undefined)
    return <AppLoadingState variant="cafe" title="جاري تحميل العرض..." />;
  if (!offer)
    return (
      <AppNotFoundState
        variant="cafe"
        description="العرض غير متاح لهذا الكافيه."
        actionHref="/menu"
        actionLabel="العودة إلى المنيو"
      />
    );
  return <OfferDetailClient offer={offer} />;
}
