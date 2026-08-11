import { DashboardSkeleton } from "@/components/shared/skeleton-patterns";

export default function PlatformLoading() {
  return <main dir="rtl" className="min-h-screen bg-[#F5F5F5] text-[#111111]"><div className="mx-auto w-full max-w-[1500px]"><DashboardSkeleton /></div></main>;
}
