import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CustomerEmptyCart({
  title,
  description,
  itemsLabel,
  browseLabel,
  menuHref,
}: {
  title: string;
  description: string;
  itemsLabel: string;
  browseLabel: string;
  menuHref: string;
}) {
  return (
    <Card className="overflow-hidden rounded-md border-primary/20 bg-card shadow-sm">
      <CardContent className="flex flex-col items-center px-5 py-12 text-center sm:px-8 sm:py-14">
        <div className="mb-6 h-28 w-28">
          <svg
            viewBox="0 0 420 320"
            role="img"
            aria-label={title}
            className="h-full w-full"
          >
            <defs>
              <linearGradient id="cartSteam" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--tenant-secondary)" />
                <stop offset="100%" stopColor="var(--tenant-accent)" />
              </linearGradient>
              <linearGradient id="cartCup" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--tenant-secondary)" />
                <stop offset="100%" stopColor="var(--tenant-secondary)" />
              </linearGradient>
              <filter
                id="cartShadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="160%"
              >
                <feDropShadow
                  dx="0"
                  dy="18"
                  stdDeviation="18"
                  floodColor="#000000"
                  floodOpacity="0.28"
                />
              </filter>
            </defs>
            <path
              d="M35 248 C90 220 115 258 168 235 C218 214 241 218 292 239 C335 257 361 238 391 218 L391 320 L35 320 Z"
              fill="var(--tenant-secondary)"
            />
            <circle
              cx="332"
              cy="72"
              r="38"
              fill="var(--tenant-primary)"
              opacity="0.08"
            />
            <circle
              cx="84"
              cy="88"
              r="20"
              fill="var(--tenant-primary)"
              opacity="0.08"
            />
            <path
              d="M132 122 C125 94 153 86 145 58"
              stroke="url(#cartSteam)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
            <path
              d="M183 116 C172 83 208 75 196 42"
              stroke="url(#cartSteam)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              opacity="0.65"
            />
            <path
              d="M238 122 C229 96 260 86 251 58"
              stroke="url(#cartSteam)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
            <g filter="url(#cartShadow)">
              <path d="M112 137 H275 L254 251 H135 Z" fill="url(#cartCup)" />
              <path
                d="M277 160 H302 C326 160 333 196 309 209 L267 232"
                fill="none"
                stroke="var(--tenant-secondary)"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <path
                d="M126 157 H263 L257 189 H132 Z"
                fill="var(--tenant-primary)"
                opacity="0.9"
              />
              <path
                d="M143 251 H246"
                stroke="var(--tenant-primary)"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.55"
              />
            </g>
            <g transform="translate(74 244)">
              <circle cx="32" cy="32" r="22" fill="var(--tenant-secondary)" />
              <circle cx="242" cy="32" r="22" fill="var(--tenant-secondary)" />
              <path
                d="M20 0 H259"
                stroke="var(--tenant-secondary)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M0 -54 H46 L70 0"
                stroke="var(--tenant-secondary)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
            <path
              d="M316 143 L337 164 L379 119"
              stroke="var(--tenant-secondary)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <div className="mb-6 space-y-3">
          <div className="mx-auto w-fit rounded-full border bg-muted px-3 py-1 text-[0.7rem] font-black uppercase tracking-[0.12em] text-muted-foreground">
            {itemsLabel}: 0
          </div>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
        <Button
          asChild
          className="h-11 gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:text-primary-foreground"
        >
          <Link
            href={menuHref}
            className="inline-flex items-center justify-center whitespace-nowrap"
          >
            <ShoppingBag className="h-4 w-4" />
            {browseLabel}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
