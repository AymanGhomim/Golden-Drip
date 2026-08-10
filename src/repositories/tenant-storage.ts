const PREFIX = "tenant-data:v1";

function key(tenantId: string, resource: string) { return `${PREFIX}:${tenantId}:${resource}`; }
function branchResource(branchId: string, resource: string) { return `branch:${branchId}:${resource}`; }

export const tenantStorage = {
  get<T>(tenantId: string, resource: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try { const raw = window.localStorage.getItem(key(tenantId, resource)); return raw ? JSON.parse(raw) as T : fallback; } catch { window.localStorage.removeItem(key(tenantId, resource)); return fallback; }
  },
  set<T>(tenantId: string, resource: string, value: T) { if (typeof window !== "undefined") window.localStorage.setItem(key(tenantId, resource), JSON.stringify(value)); return value; },
  remove(tenantId: string, resource: string) { if (typeof window !== "undefined") window.localStorage.removeItem(key(tenantId, resource)); },
  getForBranch<T>(tenantId: string, branchId: string, resource: string, fallback: T): T { return this.get(tenantId, branchResource(branchId, resource), fallback); },
  setForBranch<T>(tenantId: string, branchId: string, resource: string, value: T) { return this.set(tenantId, branchResource(branchId, resource), value); },
  removeForBranch(tenantId: string, branchId: string, resource: string) { this.remove(tenantId, branchResource(branchId, resource)); },
};
