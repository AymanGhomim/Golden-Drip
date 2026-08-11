import type { CSSProperties } from "react";
import { LogOut } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { canAccess } from "@/auth/access";
import { navigationGroups } from "@/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { branchChanged, sessionEnded } from "@/store/auth-slice";
import { ordersReplaced } from "@/store/orders-slice";
import { developmentSnapshotCleared, developmentSnapshotLoaded } from "@/store/development-slice";

export function AppShell() {
  const session = useAppSelector((state) => state.auth.session);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  if (!session) return null;
  const singleBranchCafe = session.accessibleBranches.length === 1;
  const brand = session.tenant.branding;
  const style = {
    "--brand-primary": brand.primary,
    "--brand-secondary": brand.secondary,
    "--brand-accent": brand.accent,
    "--brand-bg": brand.background,
    "--brand-surface": brand.surface,
    "--brand-sidebar": brand.sidebar,
    "--brand-sidebar-text": brand.sidebarText,
    "--brand-text": brand.textPrimary,
    "--brand-muted": brand.textSecondary,
    "--brand-border": brand.border,
    "--brand-sidebar-active": brand.sidebarActive ?? brand.primary,
    "--brand-sidebar-active-fg": brand.sidebarActiveForeground ?? brand.primaryForeground ?? "#ffffff",
    "--brand-radius": brand.radius,
    fontFamily: brand.fontFamily ? `${brand.fontFamily}, Tahoma, Arial, sans-serif` : undefined,
  } as CSSProperties;
  const changeBranch = async (branchId: string) => {
    dispatch(branchChanged(branchId));
    if (import.meta.env.DEV) {
      const { desktopDevelopmentRepository } = await import("@/dev/development-repository");
      const snapshot = desktopDevelopmentRepository.createSnapshot(session.tenant.id, branchId);
      dispatch(developmentSnapshotLoaded(snapshot));
      dispatch(ordersReplaced(snapshot.orders));
    }
  };
  return (
    <div style={style} className="grid min-h-screen grid-cols-[270px_1fr] bg-[var(--brand-bg)] text-[var(--brand-text)]">
      <aside className="sticky top-0 h-screen overflow-y-auto border-l border-[var(--brand-border)] bg-[var(--brand-sidebar)] p-4 text-[var(--brand-sidebar-text)]">
        <div className="flex items-center gap-3 border-b border-[var(--brand-border)] pb-4">
          <img src={brand.logo} alt="" className="h-12 w-12 rounded-xl object-contain" />
          <div><p className="font-black">{session.tenant.name}</p><p className="text-xs opacity-70">Desktop Admin</p></div>
        </div>
        <nav className="mt-4 space-y-5">
          {navigationGroups.map((group) => {
            const items = group.items.filter(
              (item) =>
                canAccess(session, item) &&
                !(singleBranchCafe && item.path === "/branches"),
            );
            return items.length ? (
              <section key={group.label}>
                <p className="mb-2 px-3 text-[11px] font-bold opacity-60">{group.label}</p>
                <div className="space-y-1">{items.map((item) => <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${isActive ? "bg-[var(--brand-sidebar-active)] text-[var(--brand-sidebar-active-fg)] shadow" : "hover:bg-white/40"}`}><item.icon className="h-4 w-4" />{item.label}</NavLink>)}</div>
              </section>
            ) : null;
          })}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[var(--brand-border)] bg-[var(--brand-surface)]/95 px-7 backdrop-blur">
          {!singleBranchCafe ? <div><p className="text-xs text-[var(--brand-muted)]">الفرع الحالي</p><select aria-label="الفرع الحالي" value={session.currentBranch?.id ?? ""} onChange={(event) => void changeBranch(event.target.value)} className="mt-1 rounded-lg border border-[var(--brand-border)] bg-white px-3 py-1.5 text-sm font-bold">{session.accessibleBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></div> : <div />}
          <div className="flex items-center gap-4"><div className="text-left"><p className="font-bold">{session.employee.name}</p><p className="text-xs text-[var(--brand-muted)]">{session.role.name}</p></div><button className="rounded-xl border border-red-200 p-2.5 text-red-600 hover:bg-red-50" title="تسجيل الخروج" onClick={() => { dispatch(sessionEnded()); dispatch(ordersReplaced([])); dispatch(developmentSnapshotCleared()); navigate("/login", { replace: true }); }}><LogOut className="h-5 w-5" /></button></div>
        </header>
        <main className="p-7"><Outlet /></main>
      </div>
    </div>
  );
}
