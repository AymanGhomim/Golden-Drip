"use client";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBranch } from "@/providers/branch-provider";
import { useCurrentEmployee } from "@/providers/current-employee-provider";
import { DetailsSkeleton } from "@/components/shared/skeleton-patterns";

export function BranchRequired({ children }: { children: React.ReactNode }) {
  const { branch, loading } = useBranch();
  const { hasPermission } = useCurrentEmployee();
  if (loading) return <div className="p-5"><DetailsSkeleton /></div>;
  if (!branch) return <section dir="rtl" className="mx-auto flex min-h-[70vh] max-w-xl items-center px-5"><div className="w-full rounded-2xl border border-dashed bg-card p-10 text-center"><MapPin className="mx-auto h-10 w-10 text-muted-foreground" /><h1 className="mt-4 text-xl font-black">أضف فرعًا أولًا لبدء استخدام هذه الصفحة</h1><p className="mt-2 text-sm text-muted-foreground">{hasPermission("branches.manage") ? "بعد إضافة الفرع ستتمكن من إدارة بيانات التشغيل الخاصة به." : "تواصل مع مالك الحساب أو مدير لديه صلاحية إدارة الفروع."}</p>{hasPermission("branches.manage") ? <Button asChild className="mt-6"><Link href="/admin/branches/new">إضافة أول فرع</Link></Button> : null}</div></section>;
  return <>{children}</>;
}
