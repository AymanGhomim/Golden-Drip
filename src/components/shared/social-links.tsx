"use client";

import { Facebook, Instagram, MapPin, MessageCircle, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/menu-translations";
import { cn } from "@/lib/utils";
import { useTenant } from "@/providers/tenant-provider";

export function SocialLinks({
  locale: _locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const { tenant } = useTenant();
  const contact = tenant.contact;
  const links = [
    contact?.whatsapp && {
      key: "whatsapp",
      label: "WhatsApp",
      href: /^https?:\/\//i.test(contact.whatsapp)
        ? contact.whatsapp
        : `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`,
      icon: MessageCircle,
    },
    contact?.facebook && {
      key: "facebook",
      label: "Facebook",
      href: contact.facebook,
      icon: Facebook,
    },
    contact?.instagram && {
      key: "instagram",
      label: "Instagram",
      href: contact.instagram,
      icon: Instagram,
    },
    contact?.tiktok && {
      key: "tiktok",
      label: "TikTok",
      href: contact.tiktok,
      icon: Music2,
    },
    contact?.locationUrl && {
      key: "location",
      label: "Location",
      href: contact.locationUrl,
      icon: MapPin,
    },
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    href: string;
    icon: typeof Facebook;
  }>;

  if (!links.length) return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {links.map(({ key, label, href, icon: Icon }) => (
        <Button
          key={key}
          asChild
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full border-primary/15 bg-card text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-accent-foreground hover:shadow-md sm:h-9 sm:w-9"
        >
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            title={label}
          >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </a>
        </Button>
      ))}
    </div>
  );
}
