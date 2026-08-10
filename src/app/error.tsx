"use client";

import { AppErrorState } from "@/components/feedback/app-state";

export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <AppErrorState variant="neutral" reset={reset} backHref="/" backLabel="العودة إلى البداية" fullScreen />;
}
