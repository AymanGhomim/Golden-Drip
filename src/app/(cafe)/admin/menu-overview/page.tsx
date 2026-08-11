"use client";

import Link from "next/link";
import { BarChart3, ExternalLink, Globe2, PackageCheck, QrCode, Settings2, ShoppingBag, Truck } from "lucide-react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const money = (value: number) => `${value.toLocaleString("ar-EG")} ج.م`;
const hourly = [
  { hour: "10 ص", value: 4 }, { hour: "12 م", value: 9 },
  { hour: "2 م", value: 15 }, { hour: "4 م", value: 11 },
  { hour: "6 م", value: 19 }, { hour: "8 م", value: 24 },
  { hour: "10 م", value: 17 },
];
const types = [
  { name: "داخل الكافيه", value: 42, color: "var(--tenant-primary)" },
  { name: "تيك أواي", value: 27, color: "var(--tenant-secondary)" },
  { name: "توصيل", value: 15, color: "var(--tenant-accent)" },
];

export default function MenuOverviewPage() {
  return (
    <AdminShell>
      <section dir="rtl" className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold text-accent">المنيو الإلكتروني</p>
            <h1 className="mt-1 text-2xl font-black">نظرة عامة</h1>
            <p className="mt-1 text-sm text-muted-foreground">تابع أداء المنيو والطلبات القادمة من القنوات الإلكترونية.</p>
          </div>
          <Badge className="w-fit bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">المنيو مفتوح ويقبل الطلبات</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <AdminStatCard label="حالة المنيو" value="مفتوح" icon={Globe2} />
          <AdminStatCard label="طلبات اليوم" value="84" icon={ShoppingBag} />
          <AdminStatCard label="طلبات QR" value="40" icon={QrCode} />
          <AdminStatCard label="تيك أواي" value="27" icon={ShoppingBag} />
          <AdminStatCard label="توصيل" value="15" icon={Truck} />
          <AdminStatCard label="الإيرادات" value={money(8650)} icon={BarChart3} />
          <AdminStatCard label="متوسط الطلب" value={money(103)} icon={BarChart3} />
          <AdminStatCard label="الأكثر طلبًا" value="آيس لاتيه" icon={PackageCheck} />
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_0.8fr]">
          <Card className="rounded-xl">
            <CardHeader className="p-4"><CardTitle className="text-base">الطلبات حسب الساعة</CardTitle></CardHeader>
            <CardContent className="h-64 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourly}>
                  <defs><linearGradient id="menuSales" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--tenant-primary)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--tenant-primary)" stopOpacity={0.03} /></linearGradient></defs>
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="var(--tenant-primary)" fill="url(#menuSales)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardHeader className="p-4"><CardTitle className="text-base">الطلبات حسب النوع</CardTitle></CardHeader>
            <CardContent className="h-64 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={types} dataKey="value" nameKey="name" innerRadius={48} outerRadius={76} paddingAngle={4}>{types.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
              <div className="space-y-1">{types.map((item) => <div key={item.name} className="flex justify-between text-xs"><span>{item.name}</span><b>{item.value}</b></div>)}</div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <MenuList title="أحدث طلبات QR" icon={QrCode} rows={["ORD-142 · طاولة 07 · 310 ج.م", "ORD-140 · طاولة 03 · 225 ج.م", "ORD-139 · طاولة 05 · 180 ج.م"]} />
          <MenuList title="أحدث طلبات Takeaway" icon={ShoppingBag} rows={["ORD-141 · منى · 305 ج.م", "ORD-137 · أحمد · 185 ج.م"]} />
          <MenuList title="أحدث طلبات Delivery" icon={Truck} rows={["ORD-138 · عمر · 240 ج.م", "ORD-136 · سارة · 410 ج.م"]} />
          <MenuList title="الأكثر طلبًا أونلاين" icon={PackageCheck} rows={["سبانيش آيس لاتيه · 42 طلبًا", "كابتشينو · 37 طلبًا", "فرابيه كراميل · 31 طلبًا"]} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild><Link href="/admin/menu-settings"><Settings2 className="ml-2 h-4 w-4" />إعدادات المنيو</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/qr"><QrCode className="ml-2 h-4 w-4" />رموز QR</Link></Button>
          <Button asChild variant="outline"><Link href="/menu" target="_blank" rel="noreferrer"><ExternalLink className="ml-2 h-4 w-4" />فتح المنيو</Link></Button>
        </div>
      </section>
    </AdminShell>
  );
}

function MenuList({ title, icon: Icon, rows }: { title: string; icon: typeof QrCode; rows: string[] }) {
  return <Card className="rounded-xl"><CardHeader className="p-4"><CardTitle className="flex items-center gap-2 text-sm"><Icon className="h-4 w-4 text-accent" />{title}</CardTitle></CardHeader><CardContent className="space-y-2 p-4 pt-0">{rows.map((row) => <div key={row} className="rounded-lg border p-3 text-xs font-semibold">{row}</div>)}</CardContent></Card>;
}
