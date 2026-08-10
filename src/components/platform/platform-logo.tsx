import { cn } from "@/lib/utils";
import { PLATFORM_CONFIG } from "@/config/platform.config";
import Image from "next/image";

export function PlatformLogo({ compact = false, light = false, className }: { compact?: boolean; light?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-cyan-900/10">
        <Image src="/logo platform.png" alt="Penta-K" fill sizes="44px" className="object-contain p-1" priority />
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className={cn("text-lg font-black tracking-tight", light ? "text-white" : "text-[#101828]")}>{PLATFORM_CONFIG.name}</p>
          <p className={cn("text-[10px] font-bold", light ? "text-slate-300" : "text-[#667085]")}>{PLATFORM_CONFIG.tagline}</p>
        </div>
      ) : null}
    </div>
  );
}
