import { OfferPageResolver } from "./offer-page-resolver";

export default async function OfferPage({ params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  return <OfferPageResolver offerId={offerId} />;
}
