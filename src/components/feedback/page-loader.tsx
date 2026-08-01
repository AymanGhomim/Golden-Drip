"use client";

import { LoadingState } from "@/components/shared/loading-state";

export function PageLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <LoadingState />
    </main>
  );
}
