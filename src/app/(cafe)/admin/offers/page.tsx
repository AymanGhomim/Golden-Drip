"use client";
import { Gift, Plus, TicketPercent } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cafeDataService } from "@/services/cafe-data.service";
export default function OffersPage() {
  const offers = cafeDataService.getOffers();
  return (
    <AdminShell>
      <section dir="rtl" className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-accent">إدارة المنيو</p>
            <h1 className="mt-1 text-2xl font-black">العروض</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              عروض المستأجر الحالي فقط.
            </p>
          </div>
          <Button disabled title="إنشاء العروض غير متاح في هذه المرحلة">
            <Plus className="ml-2 h-4 w-4" />
            إنشاء عرض
          </Button>
        </div>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <AdminStatCard
            label="العروض النشطة"
            value={offers.filter((offer) => offer.isActive).length}
            icon={Gift}
          />
          <AdminStatCard
            label="إجمالي العروض"
            value={offers.length}
            icon={Gift}
          />
          <AdminStatCard
            label="استخدامات اليوم"
            value={offers.length * 8}
            icon={TicketPercent}
          />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-right text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {[
                      "العرض",
                      "الوصف",
                      "السعر",
                      "السعر قبل الخصم",
                      "الحالة",
                    ].map((heading) => (
                      <th key={heading} className="p-4 font-bold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => (
                    <tr key={offer.id} className="border-t">
                      <td className="p-4 font-black">{offer.title}</td>
                      <td className="p-4 text-muted-foreground">
                        {offer.description}
                      </td>
                      <td className="p-4 font-bold">{offer.price} ج.م</td>
                      <td className="p-4">{offer.originalPrice} ج.م</td>
                      <td className="p-4">
                        <Badge
                          className={
                            offer.isActive
                              ? "bg-emerald-500/15 text-emerald-700"
                              : "bg-muted"
                          }
                        >
                          {offer.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {!offers.length ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-12 text-center text-muted-foreground"
                      >
                        لا توجد عروض حتى الآن
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
