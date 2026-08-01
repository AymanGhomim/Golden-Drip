import { notFound } from "next/navigation";
import { mockOffers } from "@/mocks/offers.mock";
import { OfferDetailClient } from "./offer-detail-client";

export default function OfferPage({ params }: { params: { offerId: string } }) {
  const offer = mockOffers.find((item) => item.id === params.offerId);
  if (!offer) notFound();
  return <OfferDetailClient offer={offer} />;
}
