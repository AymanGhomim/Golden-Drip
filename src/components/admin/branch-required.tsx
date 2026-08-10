"use client";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBranch } from "@/providers/branch-provider";

export function BranchRequired({ children }: { children: React.ReactNode }) {
  const { branch, loading } = useBranch();
  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">جارٍ تحميل بيانات الفرع...</div>;
  if (!branch) return <section dir="rtl" className="mx-auto flex min-h-[70vh] max-w-xl items-center px-5"><div className="w-full rounded-2xl border border-dashed bg-card p-10 text-center"><MapPin className="mx-auto h-10 w-10 text-muted-foreground" /><h1 className="mt-4 text-xl font-black">لم تتم إضافة أي فروع حتى الآن</h1><p className="mt-2 text-sm text-muted-foreground">أضف فرعًا أولًا لبدء استخدام هذه الصفحة.</p><Button asChild className="mt-6"><Link href="/admin/branches/new">إضافة أول فرع</Link></Button></div></section>;
  return <>{children}</>;
}
