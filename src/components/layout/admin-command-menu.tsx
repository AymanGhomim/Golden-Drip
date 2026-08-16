"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AdminNavItem } from "@/components/layout/admin-navigation";
import { cn } from "@/lib/utils";

export function AdminCommandMenu({
  open,
  onOpenChange,
  items,
  favoriteHrefs,
  onToggleFavorite,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: AdminNavItem[];
  favoriteHrefs: string[];
  onToggleFavorite: (href: string) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ar");
    return normalized
      ? items.filter((item) =>
          `${item.label} ${item.href}`.toLocaleLowerCase("ar").includes(normalized),
        )
      : items;
  }, [items, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b p-5 text-right">
          <DialogTitle>الانتقال السريع</DialogTitle>
          <DialogDescription>
            ابحث داخل الصفحات المسموحة لك، واضغط النجمة لتثبيت الصفحة في المفضلة.
          </DialogDescription>
        </DialogHeader>
        <div className="relative p-4">
          <Search className="absolute right-7 top-7 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن صفحة..."
            className="pr-10"
          />
        </div>
        <div className="max-h-[55vh] overflow-y-auto px-2 pb-3">
          {filtered.map((item) => {
            const Icon = item.icon;
            const favorite = favoriteHrefs.includes(item.href);
            return (
              <div
                key={item.href}
                className="flex items-center gap-1 rounded-lg hover:bg-muted/60"
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-right text-sm font-bold"
                  onClick={() => {
                    router.push(item.href);
                    onOpenChange(false);
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{item.label}</span>
                </button>
                <button
                  type="button"
                  className={cn(
                    "m-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-background",
                    favorite ? "text-amber-500" : "text-muted-foreground",
                  )}
                  onClick={() => onToggleFavorite(item.href)}
                  aria-label={favorite ? `إزالة ${item.label} من المفضلة` : `إضافة ${item.label} إلى المفضلة`}
                >
                  <Star className={cn("h-4 w-4", favorite && "fill-current")} />
                </button>
              </div>
            );
          })}
          {!filtered.length ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              لا توجد صفحة مطابقة.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
