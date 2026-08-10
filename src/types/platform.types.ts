import type { TenantFeatures } from "@/types/tenant.types";

export type FeatureKey = keyof TenantFeatures;
export type Plan = { id: string; code: string; name: string; description: string; price?: number; active: boolean; maxBranches: number; features: FeatureKey[] };
