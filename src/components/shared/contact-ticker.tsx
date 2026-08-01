"use client";

import { MapPin, Phone } from "lucide-react";

import type { Locale } from "@/lib/menu-translations";

const phoneNumbers = ["01050555375", "01011329575"];
const address = "شارع الاستاد امام بوابه سيتي كلوب الخلفيه";

export function ContactTicker({ locale }: { locale: Locale }) {
  const addressLabel = locale === "ar" ? address : "El Estad St, behind City Club back gate";
  const items = [
    { key: "address", icon: MapPin, text: addressLabel },
    ...phoneNumbers.map((phone) => ({ key: phone, icon: Phone, text: phone })),
  ];
  const tickerItems = [...items, ...items];

  return (
    <div className="overflow-hidden border-t bg-accent/10 text-foreground">
      <div className="contact-ticker flex w-max items-center gap-6 py-2">
        {tickerItems.map(({ key, icon: Icon, text }, index) => (
          <div key={`${key}-${index}`} className="flex shrink-0 items-center gap-2 px-2 text-xs font-bold sm:text-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-accent shadow-sm">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="whitespace-nowrap">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
