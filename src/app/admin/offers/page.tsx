import Image from "next/image";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { OfferPrice } from "@/components/shared/offer-price";
import { mockOffers } from "@/mocks/offers.mock";

export default function OffersPage() {
  const activeOffers = mockOffers.filter((offer) => offer.isActive);

  return (
    <AdminShell>
      <section className="animate-content-enter mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Golden Drip management
        </p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold">Offers</h1>
            <p className="mt-2 text-muted-foreground">
              Manage promotional banners shown at the top of the menu.
            </p>
          </div>
          <Card className="w-full sm:w-56">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active offers</p>
              <p className="mt-1 text-3xl font-bold">{activeOffers.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {mockOffers
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((offer) => (
              <Card key={offer.id} className="overflow-hidden rounded-md">
                <CardContent className="grid gap-4 p-4 sm:grid-cols-[12rem_1fr]">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-muted sm:aspect-auto">
                    <Image
                      src={offer.image}
                      alt={offer.title}
                      fill
                      sizes="(min-width: 1024px) 192px, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-semibold">{offer.title}</h2>
                      <Badge variant={offer.isActive ? "default" : "secondary"}>
                        {offer.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </div>
                    <p className="mt-2 leading-7 text-muted-foreground">{offer.description}</p>
                    <OfferPrice
                      originalPrice={offer.originalPrice}
                      price={offer.price}
                      className="mt-3"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>
    </AdminShell>
  );
}
