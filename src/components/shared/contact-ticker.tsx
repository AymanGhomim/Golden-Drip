"use client";

import { Facebook, Instagram, MapPin, Music2, Phone } from "lucide-react";

import type { Locale } from "@/lib/menu-translations";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type TickerItem = {
  key: string;
  icon: LucideIcon;
  text: string;
  href?: string;
};

const phoneNumbers = ["01050555375", "01011329575"];
const locationUrl =
  "https://www.google.com/maps/place/4X62%2BG79+golden+drip+coffee,+%D9%82%D8%B3%D9%85+%D9%83%D9%81%D8%B1+%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%D8%8C+%D9%83%D9%81%D8%B1+%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%D8%8C+%D9%85%D8%AD%D8%A7%D9%81%D8%B8%D8%A9+%D9%83%D9%81%D8%B1+%D8%A7%D9%84%D8%B4%D9%8A%D8%AE+6860530%E2%80%AD/data=!4m2!3m1!1s0x14f7ab0048b3fb69:0x6bd69c41de884133!18m1!1e1?entry=gps&coh=192189&g_ep=CAESBzI2LjIwLjEYACCenQoqlQEsOTQyNjc3MjcsOTQyOTIxOTUsOTQyOTk1MzIsMTAwNzk2NDk4LDEwMDc5Nzc2MSwxMDA3OTY1MzUsMTAwODE1MDM2LDk0MjgwNTc2LDk0MjA3Mzk0LDk0MjA3NTA2LDk0MjA4NTA2LDk0MjE4NjUzLDk0MjI5ODM5LDk0Mjc1MTY4LDk0Mjc5NjE5LDEwMDc5MjU3MkICRUc%3D&skid=6d7adfd0-f010-49b2-bc45-93431f164b9d";
const socialLinks: TickerItem[] = [
  {
    key: "facebook",
    icon: Facebook,
    text: "Facebook",
    href: "https://www.facebook.com/people/Golden-Drip/61581964776493/?rdid=8xWLmtdyFR35APth&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1E9gCqSdbr%2F",
  },
  {
    key: "instagram",
    icon: Instagram,
    text: "Instagram",
    href: "https://www.instagram.com/goldendrip.cafe",
  },
  {
    key: "tiktok",
    icon: Music2,
    text: "TikTok",
    href: "https://www.tiktok.com/@golden_drip_?_r=1",
  },
];
const address = "شارع الاستاد امام بوابه سيتي كلوب الخلفيه";

export function ContactTicker({ locale }: { locale: Locale }) {
  const addressLabel = locale === "ar" ? address : "El Estad St, behind City Club back gate";
  const items: TickerItem[] = [
    { key: "address", icon: MapPin, text: addressLabel, href: locationUrl },
    ...phoneNumbers.map((phone) => ({ key: phone, icon: Phone, text: phone })),
    ...socialLinks,
  ];
  const tickerItems = [...items, ...items, ...items];

  return (
    <div className="overflow-hidden border-t bg-accent/10 text-foreground">
      <div
        className={cn(
          "flex w-max min-w-full items-center gap-8 py-2",
          locale === "ar" ? "contact-ticker-rtl" : "contact-ticker-ltr",
        )}
      >
        {tickerItems.map(({ key, icon: Icon, text, href }, index) => {
          const content = (
            <>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-accent shadow-sm">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="whitespace-nowrap">{text}</span>
            </>
          );

          return href ? (
            <a
              key={`${key}-${index}`}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 items-center gap-2 px-2 text-xs font-bold transition-colors hover:text-accent sm:text-sm"
            >
              {content}
            </a>
          ) : (
            <div key={`${key}-${index}`} className="flex shrink-0 items-center gap-2 px-2 text-xs font-bold sm:text-sm">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
