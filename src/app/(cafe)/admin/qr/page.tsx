"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Printer, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBranch } from "@/providers/branch-provider";
import { useTenant } from "@/providers/tenant-provider";
import { cafeDataService } from "@/services/cafe-data.service";
import type { Table } from "@/types/table.types";
import { getContrastForeground, normalizeTenantBranding } from "@/lib/tenant-branding";

export default function QrManagementPage() {
  const { tenant } = useTenant();
  const branding = normalizeTenantBranding(tenant.branding);
  const requestedQrColor = branding.qr?.foregroundColor || branding.primary;
  const qrForeground =
    getContrastForeground(requestedQrColor) === "#FFFFFF"
      ? requestedQrColor
      : "#111827";
  const { branch } = useBranch();
  const [query, setQuery] = useState("");
  const [allTables, setAllTables] = useState<Table[]>([]);
  useEffect(() => {
    const reload = () => setAllTables(cafeDataService.getTables());
    reload();
    window.addEventListener("tenant:changed", reload);
    window.addEventListener("branch:changed", reload);
    return () => {
      window.removeEventListener("tenant:changed", reload);
      window.removeEventListener("branch:changed", reload);
    };
  }, []);
  const tables = useMemo(
    () => allTables.filter((table) => String(table.number).includes(query)),
    [allTables, query],
  );
  const menuUrl = (table: Table) =>
    `/menu?tenant=${encodeURIComponent(tenant.slug)}&branch=${encodeURIComponent(branch?.id ?? "")}&table=${encodeURIComponent(String(table.number))}`;
  return (
    <AdminShell>
      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5"
      >
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold text-accent">المنيو الإلكتروني</p>
            <h1 className="mt-1 text-2xl font-black">رموز QR</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              كل رابط مرتبط بالكافيه والفرع والطاولة الحالية.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
          >
            <Printer className="ml-2 h-4 w-4" />
            طباعة الصفحة
          </Button>
        </div>
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="بحث برقم الطاولة"
            className="pr-9"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {tables.map((table) => (
            <Card key={table.id} className="overflow-hidden rounded-xl">
              <CardContent className="p-4">
                <div className="mb-3 flex justify-center">
                  <AppLogo showText={false} size="sm" />
                </div>
                <div
                  aria-label={`معاينة رمز الطاولة ${table.number}`}
                  className="mx-auto flex h-36 w-36 items-center justify-center rounded-lg border-4 border-foreground bg-white p-3"
                >
                  <div className="grid h-full w-full grid-cols-9 grid-rows-9 gap-0.5">
                    {Array.from({ length: 81 }, (_, index) => (
                      <span
                        key={index}
                        className={
                          (index * 17 + index * index + table.number) % 7 < 3 ||
                          index < 9 ||
                          index % 9 === 0 ||
                          index > 71 ||
                          index % 9 === 8
                            ? ""
                            : "bg-white"
                        }
                        style={
                          (index * 17 + index * index + table.number) % 7 < 3 ||
                          index < 9 ||
                          index % 9 === 0 ||
                          index > 71 ||
                          index % 9 === 8
                            ? { backgroundColor: qrForeground }
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h2 className="font-black">
                    طاولة {String(table.number).padStart(2, "0")}
                  </h2>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {tenant.name} · {branch?.name}
                  </p>
                  <p className="mt-2 text-xs font-bold text-primary">
                    {branding.qr?.title || "افتح المنيو"}
                  </p>
                  {branding.qr?.helperText ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {branding.qr.helperText}
                    </p>
                  ) : null}
                  <span className="mt-2 inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    نشط
                  </span>
                </div>
                <Button
                  asChild
                  type="button"
                  variant="outline"
                  className="mt-4 w-full"
                >
                  <a href={menuUrl(table)} target="_blank" rel="noreferrer">
                    <ExternalLink className="ml-2 h-4 w-4" />
                    فتح رابط الطاولة
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {!tables.length ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
            لا توجد طاولات مطابقة في الفرع الحالي.
          </div>
        ) : null}
        <p className="mt-4 text-xs text-muted-foreground">
          المعروض معاينة بصرية فقط. توليد ملف QR قابل للمسح والتنزيل يحتاج مكتبة
          توليد مخصصة، لذلك لم تُعرض أزرار نجاح وهمية.
        </p>
      </section>
    </AdminShell>
  );
}
