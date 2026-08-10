"use client";

import { CafeRouteError } from "@/components/feedback/cafe-route-not-found";

export default function CafeError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <CafeRouteError reset={reset} />;
}
