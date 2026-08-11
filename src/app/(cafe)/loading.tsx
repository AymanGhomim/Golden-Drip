import { DashboardSkeleton } from "@/components/shared/skeleton-patterns";

export default function CafeLoading() {
  return <main dir="rtl" className="min-h-screen bg-[var(--tenant-background)] text-[var(--tenant-text-primary)]"><div className="mx-auto w-full max-w-[1500px]"><DashboardSkeleton /></div></main>;
}
