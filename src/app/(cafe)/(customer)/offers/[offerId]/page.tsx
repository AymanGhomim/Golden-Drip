import { OfferPageResolver } from "./offer-page-resolver";

export default function OfferPage({ params }: { params: { offerId: string } }) {
  return <OfferPageResolver offerId={params.offerId} />;
}
