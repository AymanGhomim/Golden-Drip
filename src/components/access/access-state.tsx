"use client";

import Link from "next/link";
import { LockKeyhole, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";

function AccessState({ icon: Icon, title, description, action }: { icon: typeof LockKeyhole; title: string; description: string; action?: React.ReactNode }) {
  return <section dir="rtl" className="mx-auto flex min-h-[55vh] max-w-xl items-center px-4">
    <div className="w-full rounded-2xl border bg-card p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted"><Icon className="h-7 w-7 text-muted-foreground" aria-hidden="true" /></div>
      <h1 className="mt-5 text-xl font-black">{title}</h1>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  </section>;
}

export function PermissionDeniedState() {
  return <AccessState icon={LockKeyhole} title="الوصول غير مسموح" description="ليس لديك صلاحية للوصول إلى هذه الصفحة. تواصل مع مالك الحساب إذا كنت تحتاج هذه الصلاحية." action={<Button asChild variant="outline"><Link href="/admin/dashboard">العودة إلى لوحة التحكم</Link></Button>} />;
}

export function FeatureUnavailableState() {
  return <AccessState icon={PackageX} title="الميزة غير متاحة" description="هذه الميزة غير متاحة في باقتك الحالية. يمكن لمالك الحساب مراجعة الباقة أو التواصل مع إدارة المنصة." />;
}
