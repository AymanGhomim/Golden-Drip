"use client";

import { MonitorX } from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";

export function AdminClientUnavailableState({ onExit }: { onExit?: () => void }) {
  return (
    <main dir="rtl" lang="ar" className="flex min-h-screen items-center justify-center bg-[var(--tenant-background)] p-6 text-[var(--tenant-text-primary)]">
      <section className="w-full max-w-md rounded-[calc(var(--tenant-radius)*2)] border border-[var(--tenant-border)] bg-[var(--tenant-surface)] p-8 text-center shadow-xl">
        <AppLogo />
        <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--tenant-primary)]/10 text-[var(--tenant-primary)]">
          <MonitorX className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-black">إدارة الكافيه غير متاحة على الويب</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--tenant-text-secondary)]">
          هذا الحساب مخصص لتطبيق سطح المكتب. استخدم تطبيق Desktop لتسجيل الدخول وإدارة الكافيه.
        </p>
        {onExit ? <Button className="mt-6 w-full" onClick={onExit}>العودة</Button> : null}
      </section>
    </main>
  );
}
