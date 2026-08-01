"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ErrorState
        title="حدث خطأ ما"
        description={error.message || "يرجى المحاولة مرة أخرى"}
        onRetry={reset}
      />
    </div>
  );
}
