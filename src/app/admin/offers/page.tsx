import Image from "next/image";
import { Plus } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { OfferPrice } from "@/components/shared/offer-price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockOffers } from "@/mocks/offers.mock";

export default function OffersPage() {
  const activeOffers = mockOffers.filter((offer) => offer.isActive);

  return (
    <AdminShell>
      <section className="animate-content-enter mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-md border bg-card shadow-sm">
          <div className="relative p-6 sm:p-7">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-primary to-accent" />
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                  Golden Drip management
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Offers</h1>
                <p className="mt-2 max-w-xl leading-7 text-muted-foreground">
                  Manage promotional banners shown at the top of the menu.
                </p>
              </div>
              <Button className="h-11 gap-2 rounded-md shadow-sm">
                <Plus className="h-4 w-4" />
                Add offer
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="rounded-md">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Active offers</p>
              <p className="mt-2 text-3xl font-bold">{activeOffers.length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-md">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Menu banners</p>
              <p className="mt-2 text-3xl font-bold">{mockOffers.length}</p>
            </CardContent>
          </Card>
          <Card className="rounded-md">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Average price</p>
              <p className="mt-2 text-3xl font-bold">135</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {mockOffers
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((offer) => (
              <Card key={offer.id} className="overflow-hidden rounded-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
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
