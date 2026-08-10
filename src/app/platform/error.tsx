"use client";

import { AppErrorState } from "@/components/feedback/app-state";

export default function PlatformError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <AppErrorState variant="platform" reset={reset} backHref="/platform/dashboard" backLabel="العودة إلى لوحة المنصة" />;
}
