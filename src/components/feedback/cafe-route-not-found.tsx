"use client";

import { usePathname } from "next/navigation";
import { AppErrorState, AppNotFoundState } from "@/components/feedback/app-state";

export function CafeRouteNotFound() {
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");
  return <AppNotFoundState variant="cafe" description="تعذر العثور على الصفحة التي تبحث عنها." actionHref={admin ? "/admin/dashboard" : "/menu"} actionLabel={admin ? "العودة إلى لوحة التحكم" : "العودة إلى المنيو"} />;
}

export function CafeRouteError({ reset }: { reset: () => void }) {
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");
  return <AppErrorState variant="cafe" reset={reset} backHref={admin ? "/admin/dashboard" : "/menu"} backLabel={admin ? "العودة إلى لوحة التحكم" : "العودة إلى المنيو"} />;
}
