"use client";

import { useState } from "react";
import { CreditCard, Globe2, MapPin, Save, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const tabs = [
  ["general", "عام", Globe2],
  ["dinein", "داخل الكافيه", MapPin],
  ["takeaway", "تيك أواي", ShoppingBag],
  ["delivery", "التوصيل", MapPin],
  ["payments", "الدفع", CreditCard],
] as const;

export default function MenuSettingsPage() {
  const [tab, setTab] = useState("general");
  const [settings, setSettings] = useState<Record<string, boolean>>({
    online: true,
    open: true,
    auto: true,
    qr: true,
    multiple: true,
    waiter: true,
    bill: true,
    cashier: true,
    electronic: false,
    takeaway: true,
    asap: true,
    scheduled: true,
    delivery: true,
    cash: true,
    card: true,
    wallet: true,
    onlinePay: false,
  });
  const toggle = (key: string) =>
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  return (
    <AdminShell>
      <section dir="rtl" className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-accent">المنيو الإلكتروني</p>
            <h1 className="mt-1 text-2xl font-black">
              إعدادات المنيو الإلكتروني
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              تحكم في قنوات الطلب والدفع والتوصيل.
            </p>
          </div>
          <Button
            type="button"
            className="h-10 rounded-lg"
            disabled
            title="الحفظ غير متاح حتى ربط إعدادات المنيو بمخزن البيانات"
          >
            <Save className="ml-2 h-4 w-4" />
            حفظ
          </Button>
        </div>
        <Card className="overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <div className="scrollbar-hidden flex gap-1 overflow-x-auto border-b p-3">
              {tabs.map(([value, label, Icon]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setTab(value)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-xs font-bold ${tab === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
            <div className="grid gap-3 p-5">
              {tab === "general" ? (
                <>
                  <SettingRow
                    title="تفعيل الطلب الإلكتروني"
                    description="السماح للعملاء بإنشاء طلبات من المنيو"
                    checked={settings.online}
                    onChange={() => toggle("online")}
                  />
                  <SettingRow
                    title="حالة المنيو"
                    description="فتح أو إغلاق استقبال الطلبات"
                    checked={settings.open}
                    onChange={() => toggle("open")}
                  />
                  <SettingRow
                    title="قبول الطلبات تلقائيًا"
                    description="إرسال الطلب للمطبخ فور إنشائه"
                    checked={settings.auto}
                    onChange={() => toggle("auto")}
                  />
                </>
              ) : null}
              {tab === "dinein" ? (
                <>
                  <SettingRow
                    title="تفعيل QR"
                    description="ربط الطلب برقم الطاولة تلقائيًا"
                    checked={settings.qr}
                    onChange={() => toggle("qr")}
                  />
                  <SettingRow
                    title="السماح بأكثر من طلب"
                    description="السماح للعميل بطلب عدة مرات من نفس الطاولة"
                    checked={settings.multiple}
                    onChange={() => toggle("multiple")}
                  />
                  <SettingRow
                    title="طلب ويتر"
                    description="السماح بطلب المساعدة من الطاولة"
                    checked={settings.waiter}
                    onChange={() => toggle("waiter")}
                  />
                  <SettingRow
                    title="طلب الحساب"
                    description="السماح بطلب الحساب من QR"
                    checked={settings.bill}
                    onChange={() => toggle("bill")}
                  />
                  <SettingRow
                    title="الدفع عند الكاشير"
                    description="إغلاق الحساب من نقطة البيع"
                    checked={settings.cashier}
                    onChange={() => toggle("cashier")}
                  />
                </>
              ) : null}
              {tab === "takeaway" ? (
                <>
                  <SettingRow
                    title="تفعيل تيك أواي"
                    description="السماح بطلبات الاستلام"
                    checked={settings.takeaway}
                    onChange={() => toggle("takeaway")}
                  />
                  <SettingRow
                    title="الاستلام الآن"
                    description="إتاحة الطلبات العاجلة"
                    checked={settings.asap}
                    onChange={() => toggle("asap")}
                  />
                  <SettingRow
                    title="استلام مجدول"
                    description="اختيار موعد الاستلام"
                    checked={settings.scheduled}
                    onChange={() => toggle("scheduled")}
                  />
                  <label className="block max-w-sm text-sm font-semibold">
                    مدة التحضير بالدقائق
                    <Input
                      defaultValue="15"
                      type="number"
                      className="mt-1 h-10 rounded-lg"
                    />
                  </label>
                </>
              ) : null}
              {tab === "delivery" ? (
                <>
                  <SettingRow
                    title="تفعيل التوصيل"
                    description="السماح بطلبات التوصيل"
                    checked={settings.delivery}
                    onChange={() => toggle("delivery")}
                  />
                  <div className="grid max-w-xl gap-3 sm:grid-cols-2">
                    <label className="text-sm font-semibold">
                      الحد الأدنى للطلب
                      <Input
                        defaultValue="150"
                        type="number"
                        className="mt-1 h-10 rounded-lg"
                      />
                    </label>
                    <label className="text-sm font-semibold">
                      وقت التوصيل المتوقع
                      <Input
                        defaultValue="45"
                        type="number"
                        className="mt-1 h-10 rounded-lg"
                      />
                    </label>
                  </div>
                  <p className="text-sm font-semibold">مناطق التوصيل</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-fit rounded-lg"
                    asChild
                  >
                    <Link href="/admin/delivery-zones">إدارة المناطق</Link>
                  </Button>
                </>
              ) : null}
              {tab === "payments" ? (
                <>
                  <SettingRow
                    title="نقدي"
                    description="الدفع عند الكاشير أو الاستلام"
                    checked={settings.cash}
                    onChange={() => toggle("cash")}
                  />
                  <SettingRow
                    title="بطاقة"
                    description="الدفع بالبطاقات"
                    checked={settings.card}
                    onChange={() => toggle("card")}
                  />
                  <SettingRow
                    title="محفظة"
                    description="المحافظ الإلكترونية"
                    checked={settings.wallet}
                    onChange={() => toggle("wallet")}
                  />
                  <SettingRow
                    title="دفع إلكتروني"
                    description="الدفع عبر بوابة الدفع"
                    checked={settings.onlinePay}
                    onChange={() => toggle("onlinePay")}
                  />
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
function SettingRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={title} />
    </div>
  );
}
