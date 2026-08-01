"use client";

import { ExternalLink, Facebook, Instagram, MapPin, Music2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/menu-translations";
import { cn } from "@/lib/utils";

const links = [
  {
    key: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/people/Golden-Drip/61581964776493/?rdid=8xWLmtdyFR35APth&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1E9gCqSdbr%2F",
    icon: Facebook,
  },
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/goldendrip.cafe",
    icon: Instagram,
  },
  {
    key: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@golden_drip_?_r=1",
    icon: Music2,
  },
  {
    key: "location",
    label: "Location",
    href: "https://www.google.com/maps/place/4X62%2BG79+golden+drip+coffee,+%D9%82%D8%B3%D9%85+%D9%83%D9%81%D8%B1+%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%D8%8C+%D9%83%D9%81%D8%B1+%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%D8%8C+%D9%85%D8%AD%D8%A7%D9%81%D8%B8%D8%A9+%D9%83%D9%81%D8%B1+%D8%A7%D9%84%D8%B4%D9%8A%D8%AE+6860530%E2%80%AD/data=!4m2!3m1!1s0x14f7ab0048b3fb69:0x6bd69c41de884133!18m1!1e1?entry=gps&coh=192189&g_ep=CAESBzI2LjIwLjEYACCenQoqlQEsOTQyNjc3MjcsOTQyOTIxOTUsOTQyOTk1MzIsMTAwNzk2NDk4LDEwMDc5Nzc2MSwxMDA3OTY1MzUsMTAwODE1MDM2LDk0MjgwNTc2LDk0MjA3Mzk0LDk0MjA3NTA2LDk0MjA4NTA2LDk0MjE4NjUzLDk0MjI5ODM5LDk0Mjc1MTY4LDk0Mjc5NjE5LDEwMDc5MjU3MkICRUc%3D&skid=6d7adfd0-f010-49b2-bc45-93431f164b9d",
    icon: MapPin,
  },
];

export function SocialLinks({ locale, className }: { locale: Locale; className?: string }) {
  const title = locale === "ar" ? "تابعنا و زورنا" : "Follow us and visit";

  return (
    <div className={cn("mt-8 rounded-md border bg-card p-4 shadow-sm", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-black">{title}</p>
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {links.map(({ key, label, href, icon: Icon }) => (
          <Button
            key={key}
            asChild
            variant="outline"
            className="h-11 gap-2 rounded-md bg-background/60 text-xs font-bold hover:bg-accent/10"
          >
            <a href={href} target="_blank" rel="noreferrer">
              <Icon className="h-4 w-4" />
              {label}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}
