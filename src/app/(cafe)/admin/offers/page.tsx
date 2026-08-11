"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Gift, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { PermissionGate } from "@/components/access/permission-gate";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cafeDataService } from "@/services/cafe-data.service";
import { cafeOperationsService } from "@/services/cafe-operations.service";
import { useTenant } from "@/providers/tenant-provider";
import type { Offer } from "@/types/offer.types";

const blank = { title: "", description: "", image: "", originalPrice: "", price: "", isActive: true };

export default function OffersPage() {
  const { tenant } = useTenant();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [viewing, setViewing] = useState<Offer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const reload = useCallback(() => setOffers(cafeDataService.getOffers().filter((offer) => offer.tenantId === tenant.id)), [tenant.id]);
  useEffect(() => { reload(); window.addEventListener("tenant:changed", reload); return () => window.removeEventListener("tenant:changed", reload); }, [reload]);
  const showForm = (offer?: Offer) => { setEditing(offer ?? null); setForm(offer ? { title: offer.title, description: offer.description, image: offer.image, originalPrice: String(offer.originalPrice), price: String(offer.price), isActive: offer.isActive } : blank); setOpen(true); };
  const save = () => {
    const price = Number(form.price); const originalPrice = Number(form.originalPrice);
    if (!form.title.trim() || !form.description.trim()) return toast.error("اسم العرض ووصفه مطلوبان.");
    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(originalPrice) || originalPrice < price) return toast.error("راجع سعر العرض والسعر قبل الخصم.");
    const value: Offer = { id: editing?.id ?? `offer-${Date.now()}`, tenantId: tenant.id, title: form.title.trim(), description: form.description.trim(), image: form.image.trim(), originalPrice, price, isActive: form.isActive, sortOrder: editing?.sortOrder ?? offers.length + 1 };
    cafeDataService.saveOffers(editing ? offers.map((offer) => offer.id === editing.id ? value : offer) : [...offers, value]);
    cafeOperationsService.audit({ module: "offers", action: editing ? "OFFER_UPDATED" : "OFFER_CREATED", description: `${editing ? "تم تعديل" : "تم إنشاء"} العرض ${value.title}`, entityType: "offer", entityId: value.id });
    setOpen(false); reload(); toast.success("تم حفظ العرض.");
  };
  const toggle = (offer: Offer) => { cafeDataService.saveOffers(offers.map((item) => item.id === offer.id ? { ...item, isActive: !item.isActive } : item)); reload(); };
  const remove = () => { if (!deleteTarget || deleteTarget.tenantId !== tenant.id) return; cafeDataService.saveOffers(offers.filter((item) => item.id !== deleteTarget.id)); cafeOperationsService.audit({ module: "offers", action: "OFFER_DELETED", description: `تم حذف العرض ${deleteTarget.title}`, entityType: "offer", entityId: deleteTarget.id }); setDeleteTarget(null); reload(); toast.success("تم حذف العرض."); };

  return <AdminShell><section dir="rtl" className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold text-accent">إدارة المنيو</p><h1 className="mt-1 text-2xl font-black">العروض</h1><p className="mt-1 text-sm text-muted-foreground">إدارة عروض الكافيه الحالي فقط.</p></div><PermissionGate permission="coupons.manage"><Button onClick={() => showForm()}><Plus className="ml-2 h-4 w-4" />إنشاء عرض</Button></PermissionGate></div><div className="mb-4 grid gap-3 sm:grid-cols-3"><AdminStatCard label="العروض النشطة" value={offers.filter((offer) => offer.isActive).length} icon={Gift} /><AdminStatCard label="إجمالي العروض" value={offers.length} icon={Gift} /><AdminStatCard label="العروض المتوقفة" value={offers.filter((offer) => !offer.isActive).length} icon={Gift} /></div><Card><CardContent className="overflow-x-auto p-0"><table className="w-full min-w-[850px] text-right text-sm"><thead className="bg-muted/50"><tr>{["العرض", "الوصف", "السعر", "قبل الخصم", "الحالة", "الإجراءات"].map((heading) => <th key={heading} className="p-4">{heading}</th>)}</tr></thead><tbody>{offers.map((offer) => <tr key={offer.id} className="border-t"><td className="p-4 font-black">{offer.title}</td><td className="max-w-sm truncate p-4 text-muted-foreground">{offer.description}</td><td className="p-4 font-bold">{offer.price} ج.م</td><td className="p-4">{offer.originalPrice} ج.م</td><td className="p-4"><Badge>{offer.isActive ? "نشط" : "متوقف"}</Badge></td><td className="p-4"><div className="flex gap-1"><Button variant="outline" size="icon" onClick={() => setViewing(offer)} aria-label="عرض"><Eye className="h-4 w-4" /></Button><PermissionGate permission="coupons.manage"><Button variant="outline" size="icon" onClick={() => showForm(offer)} aria-label="تعديل"><Pencil className="h-4 w-4" /></Button><Button variant="outline" size="icon" onClick={() => toggle(offer)} aria-label="تغيير الحالة"><Power className="h-4 w-4" /></Button><Button variant="outline" size="icon" onClick={() => setDeleteTarget(offer)} aria-label="حذف"><Trash2 className="h-4 w-4 text-destructive" /></Button></PermissionGate></div></td></tr>)}</tbody></table>{!offers.length ? <div className="p-12 text-center text-sm text-muted-foreground">لا توجد عروض حتى الآن.</div> : null}</CardContent></Card></section>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{editing ? "تعديل العرض" : "إنشاء عرض"}</DialogTitle><DialogDescription>يُحفظ العرض داخل الكافيه الحالي فقط.</DialogDescription></DialogHeader><Field label="اسم العرض" value={form.title} onChange={(title) => setForm({ ...form, title })} /><Field label="الوصف" value={form.description} onChange={(description) => setForm({ ...form, description })} /><Field label="رابط الصورة" value={form.image} onChange={(image) => setForm({ ...form, image })} /><div className="grid grid-cols-2 gap-3"><Field label="السعر قبل الخصم" type="number" value={form.originalPrice} onChange={(originalPrice) => setForm({ ...form, originalPrice })} /><Field label="سعر العرض" type="number" value={form.price} onChange={(price) => setForm({ ...form, price })} /></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />عرض نشط</label><Button onClick={save}>حفظ العرض</Button></DialogContent></Dialog>
    <Dialog open={Boolean(viewing)} onOpenChange={(value) => !value && setViewing(null)}><DialogContent dir="rtl"><DialogHeader><DialogTitle>{viewing?.title}</DialogTitle><DialogDescription>{viewing?.description}</DialogDescription></DialogHeader><p className="font-bold">{viewing?.price} ج.م بدلًا من {viewing?.originalPrice} ج.م</p></DialogContent></Dialog>
    <ConfirmDialog open={Boolean(deleteTarget)} onOpenChange={(value) => !value && setDeleteTarget(null)} title="حذف العرض؟" description="سيختفي العرض من المنيو الإلكتروني." confirmLabel="حذف" onConfirm={remove} />
  </AdminShell>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="text-sm font-bold">{label}<Input className="mt-1" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
