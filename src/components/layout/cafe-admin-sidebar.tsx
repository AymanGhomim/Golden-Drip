import Link from "next/link";
import {
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import type { AdminNavGroup } from "@/components/layout/admin-navigation";
import { cn } from "@/lib/utils";

export function CafeAdminSidebar({
  tenantName,
  employeeName,
  roleName,
  branchName,
  singleBranch,
  groups,
  pathname,
  openGroups,
  collapsed,
  mobile,
  onToggleGroup,
  onToggleCollapsed,
  onCloseMobile,
  onSignOut,
}: {
  tenantName: string;
  employeeName: string;
  roleName: string;
  branchName?: string;
  singleBranch: boolean;
  groups: AdminNavGroup[];
  pathname: string;
  openGroups: Record<string, boolean>;
  collapsed: boolean;
  mobile: boolean;
  onToggleGroup: (key: string) => void;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
  onSignOut: () => void;
}) {
  const compact = !mobile && collapsed;
  return (
    <aside
      aria-label={tenantName}
      style={{
        backgroundColor: "var(--tenant-sidebar)",
        borderColor: "var(--tenant-border)",
      }}
      className={cn(
        "flex h-full flex-col border-l p-4 shadow-2xl",
        mobile ? "w-80 max-w-[88vw]" : collapsed ? "w-[5.5rem] px-3" : "w-64",
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-[var(--tenant-border)] bg-[var(--tenant-sidebar-hover)] p-3">
        <Link href="/admin/dashboard" onClick={() => mobile && onCloseMobile()}>
          <AppLogo
            showText={!collapsed || mobile}
            size={!collapsed || mobile ? "md" : "sm"}
          />
        </Link>
        {!mobile ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-[var(--tenant-sidebar-foreground)] hover:bg-[var(--tenant-sidebar-hover)]"
            onClick={onToggleCollapsed}
            aria-label="طي الشريط الجانبي"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-[var(--tenant-sidebar-foreground)] hover:bg-[var(--tenant-sidebar-hover)]"
            onClick={onCloseMobile}
            aria-label="إغلاق القائمة"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {groups.map((group) => {
          const open = openGroups[group.key] ?? false;
          return (
            <div key={group.key} className="space-y-1">
              {!compact ? (
                <button
                  type="button"
                  onClick={() => onToggleGroup(group.key)}
                  className="flex w-full items-center justify-between px-3 pb-1.5 pt-3 text-sm font-bold leading-6 tracking-wide text-[var(--tenant-sidebar-foreground)] opacity-80"
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      open && "rotate-180",
                    )}
                  />
                </button>
              ) : null}
              {compact || open
                ? group.items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={mobile ? onCloseMobile : undefined}
                        title={compact ? item.label : undefined}
                        className={cn(
                          "group relative flex items-center rounded-lg py-2.5 text-sm font-semibold leading-6 transition-all",
                          compact
                            ? "mx-auto h-11 w-11 justify-center px-0"
                            : "gap-3 px-3",
                          active
                            ? "bg-[var(--tenant-sidebar-active)] text-[var(--tenant-sidebar-active-foreground)] shadow-md"
                            : "text-[var(--tenant-sidebar-foreground)] hover:bg-[var(--tenant-sidebar-hover)] hover:text-[var(--tenant-sidebar-foreground)]",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute inset-y-2 right-0 w-1 rounded-full bg-[var(--tenant-sidebar-active-foreground)]",
                            !active && "opacity-0",
                          )}
                        />
                        <span
                          className={cn(
                            "flex shrink-0 items-center justify-center rounded-md",
                            compact ? "h-8 w-8" : "h-7 w-7",
                            active
                              ? "bg-white/15"
                              : "bg-[var(--tenant-sidebar-hover)]",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        {!compact ? (
                          <span className="truncate">{item.label}</span>
                        ) : null}
                      </Link>
                    );
                  })
                : null}
            </div>
          );
        })}
      </nav>
      <div className="mt-4 shrink-0 rounded-lg border border-[var(--tenant-border)] bg-[var(--tenant-sidebar-hover)] p-3">
        {!compact ? (
          <div className="mb-3 text-[var(--tenant-sidebar-foreground)]">
            <p className="truncate text-xs font-black">{employeeName}</p>
            <p className="mt-1 truncate text-[11px] opacity-70">{roleName}</p>
            {!singleBranch ? (
              <p className="mt-1 truncate text-[11px] opacity-70">
                {branchName ?? "لا يوجد فرع محدد"}
              </p>
            ) : null}
          </div>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={onSignOut}
          className={cn(
            "h-10 rounded-lg border-[var(--tenant-secondary)] bg-[var(--tenant-surface)] text-xs font-bold text-[var(--tenant-text-primary)]",
            compact
              ? "w-full justify-center px-0"
              : "w-full justify-start gap-2.5 px-3",
          )}
        >
          <LogOut className="h-3.5 w-3.5" />
          {!compact ? "تسجيل الخروج" : null}
        </Button>
      </div>
    </aside>
  );
}
