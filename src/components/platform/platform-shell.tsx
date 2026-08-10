"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, LayoutDashboard, LogOut, Menu, Palette, ReceiptText, Settings, Tags, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformLogo } from "@/components/platform/platform-logo";
import { useAuthStore } from "@/store/auth.store";

const groups = [
  { title: "الرئيسية", items: [{ href: "/platform/dashboard", label: "لوحة التحكم", icon: LayoutDashboard }] },
  { title: "إدارة الكافيهات", items: [{ href: "/platform/tenants", label: "الكافيهات", icon: Building2 }, { href: "/platform/tenants/new", label: "إضافة كافيه", icon: Building2 }] },
  { title: "الاشتراكات", items: [{ href: "/platform/plans", label: "الباقات", icon: Tags }, { href: "/platform/subscriptions", label: "الاشتراكات", icon: ReceiptText }] },
  { title: "التخصيص", items: [{ href: "/platform/branding", label: "قوالب الهوية", icon: Palette }] },
  { title: "النظام", items: [{ href: "/platform/activity-log", label: "سجل النشاط", icon: ReceiptText }, { href: "/platform/settings", label: "الإعدادات", icon: Settings }] },
];

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const user = useAuthStore((state) => state.user); const logout = useAuthStore((state) => state.logout); const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { if (!user || user.role !== "platform_super_admin") router.replace("/platform/login"); }, [router, user]); useEffect(() => { setMobileOpen(false); }, [pathname]);
  if (pathname === "/platform/login") return <>{children}</>; if (!user || user.role !== "platform_super_admin") return <main className="min-h-screen bg-[#F5F5F5]" />;
  const sidebar = <aside className="flex h-full w-72 flex-col border-l border-[#D1D5DB] bg-white p-5 text-[#111111] shadow-2xl"><div className="mb-8 px-2"><PlatformLogo /><p className="mt-4 text-xs leading-6 text-slate-400">مساحة تحكم موحّدة لإدارة المقاهي والمطاعم والاشتراكات.</p></div><nav className="min-h-0 flex-1 space-y-5 overflow-y-auto">{groups.map((group) => <div key={group.title}><p className="mb-2 px-3 text-[0.68rem] font-black text-slate-400">{group.title}</p><div className="space-y-1">{group.items.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${pathname === href ? "bg-[#E5E7EB] text-[#111111]" : "text-slate-600 hover:bg-[#F3F4F6] hover:text-[#111111]"}`}><Icon className="h-4 w-4" />{label}</Link>)}</div></div>)}</nav><Button variant="outline" className="w-full gap-2 border-[#111111] bg-[#111111] text-white shadow-sm hover:bg-[#374151] hover:text-white" onClick={() => { logout(); router.replace("/platform/login"); }}><LogOut className="h-4 w-4" />تسجيل الخروج</Button></aside>;
  return <div dir="rtl" lang="ar" className="min-h-screen bg-[#F5F5F5] text-[#111111]" style={{ "--background": "0 0% 97%", "--foreground": "0 0% 7%", "--card": "0 0% 100%", "--card-foreground": "0 0% 7%", "--popover": "0 0% 100%", "--popover-foreground": "0 0% 7%", "--primary": "0 0% 10%", "--primary-foreground": "0 0% 100%", "--secondary": "0 0% 94%", "--secondary-foreground": "0 0% 10%", "--muted": "0 0% 94%", "--muted-foreground": "0 0% 40%", "--accent": "0 0% 92%", "--accent-foreground": "0 0% 10%", "--border": "0 0% 87%", "--input": "0 0% 87%", "--ring": "0 0% 25%" } as React.CSSProperties}><div className="fixed inset-y-0 right-0 hidden lg:flex">{sidebar}</div><main className="min-h-screen lg:mr-72"><header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E5E7EB] bg-[#F5F5F5]/95 px-4 py-3 backdrop-blur lg:hidden"><Button variant="outline" size="icon" className="border-[#D1D5DB] bg-white" onClick={() => setMobileOpen(true)} aria-label="فتح القائمة"><Menu className="h-4 w-4" /></Button><PlatformLogo compact /><span className="h-9 w-9" /></header>{mobileOpen ? <div className="fixed inset-0 z-40 lg:hidden"><button type="button" className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة" /><div className="relative h-full">{sidebar}<Button type="button" variant="outline" size="icon" className="absolute left-4 top-4 border-[#D1D5DB] bg-white text-[#111111] hover:bg-[#F3F4F6]" onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة"><X className="h-4 w-4" /></Button></div></div> : null}{children}</main></div>;
}
