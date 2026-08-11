"use client";

import { Facebook, Instagram, MapPin, MessageCircle, Music2, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Locale } from "@/lib/menu-translations";
import { cn } from "@/lib/utils";
import { useTenant } from "@/providers/tenant-provider";

type TickerItem = {
  key: string;
  icon: LucideIcon;
  text: string;
  href?: string;
};

function whatsappHref(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://wa.me/${value.replace(/\D/g, "")}`;
}

export function ContactTicker({ locale }: { locale: Locale }) {
  const { tenant } = useTenant();
  const contact = tenant.contact;
  const items: TickerItem[] = [
    ...(contact?.address
      ? [
          {
            key: "address",
            icon: MapPin,
            text: contact.address,
            href: contact.locationUrl,
          },
        ]
      : []),
    ...(contact?.phone
      ? [
          {
            key: "phone",
            icon: Phone,
            text: contact.phone,
            href: `tel:${contact.phone}`,
          },
        ]
      : []),
    ...(contact?.whatsapp
      ? [
          {
            key: "whatsapp",
            icon: MessageCircle,
            text: "WhatsApp",
            href: whatsappHref(contact.whatsapp),
          },
        ]
      : []),
    ...(contact?.facebook
      ? [
          {
            key: "facebook",
            icon: Facebook,
            text: "Facebook",
            href: contact.facebook,
          },
        ]
      : []),
    ...(contact?.instagram
      ? [
          {
            key: "instagram",
            icon: Instagram,
            text: "Instagram",
            href: contact.instagram,
          },
        ]
      : []),
    ...(contact?.tiktok
      ? [
          {
            key: "tiktok",
            icon: Music2,
            text: "TikTok",
            href: contact.tiktok,
          },
        ]
      : []),
  ];

  if (!items.length) return null;

  return (
    <div className="overflow-hidden border-t bg-accent/10 text-foreground">
      <div
        className={cn(
          "flex w-max min-w-[200%] items-center py-2 will-change-transform",
          locale === "ar" ? "contact-ticker-ltr" : "contact-ticker-rtl",
        )}
      >
        {[0, 1].map((groupIndex) => (
          <div
            key={groupIndex}
            className="flex w-1/2 shrink-0 items-center justify-around gap-8 px-4"
          >
            {items.map(({ key, icon: Icon, text, href }) => {
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
                  key={`${key}-${groupIndex}`}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="flex shrink-0 items-center gap-2 text-xs font-bold transition-colors hover:text-accent sm:text-sm"
                >
                  {content}
                </a>
              ) : (
                <div
                  key={`${key}-${groupIndex}`}
                  className="flex shrink-0 items-center gap-2 text-xs font-bold sm:text-sm"
                >
                  {content}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
