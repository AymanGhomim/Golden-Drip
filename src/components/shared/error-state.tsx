"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function ErrorState({ title = "تعذر تحميل البيانات", description = "حدث خطأ غير متوقع. حاول مرة أخرى دون القلق على بياناتك.", onRetry, backHref, backLabel = "العودة", className }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {(onRetry || backHref) && <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
        {backHref ? <Button asChild variant="outline"><Link href={backHref}><ArrowRight className="me-2 h-4 w-4" />{backLabel}</Link></Button> : null}
        {onRetry ? <Button onClick={onRetry}>إعادة المحاولة</Button> : null}
      </div>}
    </div>
  );
}
