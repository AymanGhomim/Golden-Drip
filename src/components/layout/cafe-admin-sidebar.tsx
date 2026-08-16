import Link from "next/link";
import {
  ChevronDown,
  LogOut,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Star,
  X,
} from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";
import { Button } from "@/components/ui/button";
import type {
  AdminNavGroup,
  AdminNavItem,
} from "@/components/layout/admin-navigation";
import { cn } from "@/lib/utils";

export function CafeAdminSidebar({
  tenantName,
  employeeName,
  roleName,
  branchName,
  activeBranchId,
  branches,
  singleBranch,
  primaryItems,
  favoriteItems,
  badgeCounts,
  groups,
  pathname,
  openGroups,
  collapsed,
  mobile,
  onToggleGroup,
  onToggleCollapsed,
  onCloseMobile,
  onBranchChange,
  onOpenSearch,
  onSignOut,
}: {
  tenantName: string;
  employeeName: string;
  roleName: string;
  branchName?: string;
  activeBranchId?: string;
  branches: Array<{ id: string; name: string }>;
  singleBranch: boolean;
  primaryItems: AdminNavItem[];
  favoriteItems: AdminNavItem[];
  badgeCounts: Record<string, number>;
  groups: AdminNavGroup[];
  pathname: string;
  openGroups: Record<string, boolean>;
  collapsed: boolean;
  mobile: boolean;
  onToggleGroup: (key: string) => void;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
  onBranchChange: (branchId: string) => void;
  onOpenSearch: () => void;
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
      <div
        className={cn(
          "mb-3 rounded-lg border border-[var(--tenant-border)] bg-[var(--tenant-sidebar-hover)] text-[var(--tenant-sidebar-foreground)]",
          compact ? "flex h-11 items-center justify-center" : "p-3",
        )}
        title={compact ? `${tenantName} — ${branchName ?? "لا يوجد فرع محدد"}` : undefined}
      >
        {compact ? (
          <MapPin className="h-4 w-4" />
        ) : (
          <>
            <p className="truncate text-xs font-black">{tenantName}</p>
            {singleBranch ? (
              <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] opacity-75">
                <MapPin className="h-3 w-3 shrink-0" />
                {branchName ?? branches[0]?.name ?? "لا يوجد فرع"}
              </p>
            ) : branches.length ? (
              <label className="mt-2 block">
                <span className="sr-only">الفرع الحالي</span>
                <select
                  value={activeBranchId ?? ""}
                  onChange={(event) => onBranchChange(event.target.value)}
                  className="h-9 w-full rounded-md border border-[var(--tenant-border)] bg-[var(--tenant-surface)] px-2 text-xs font-bold text-[var(--tenant-text-primary)]"
                >
                  <option value="" disabled>اختر الفرع</option>
                  {branches.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="mt-1 text-[11px] opacity-70">لا توجد فروع متاحة</p>
            )}
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onOpenSearch}
        className={cn(
          "mb-3 flex h-10 items-center rounded-lg border border-[var(--tenant-border)] bg-[var(--tenant-sidebar-hover)] text-[var(--tenant-sidebar-foreground)] transition-colors hover:brightness-110",
          compact ? "justify-center px-0" : "gap-2 px-3",
        )}
        aria-label="البحث السريع"
      >
        <Search className="h-4 w-4 shrink-0" />
        {!compact ? (
          <>
            <span className="flex-1 text-right text-xs font-bold opacity-75">انتقل إلى…</span>
            <kbd className="rounded border border-[var(--tenant-border)] px-1.5 py-0.5 text-[10px] opacity-60">Ctrl K</kbd>
          </>
        ) : null}
      </button>
      <nav
        className={cn(
          "min-h-0 flex-1 space-y-2",
          compact ? "overflow-visible" : "overflow-y-auto",
        )}
      >
        {favoriteItems.length ? (
          <div className="space-y-1">
            {!compact ? (
              <p className="flex items-center gap-2 px-3 pb-1 pt-2 text-xs font-black tracking-wide text-[var(--tenant-sidebar-foreground)] opacity-60">
                <Star className="h-3.5 w-3.5 fill-current" />
                المفضلة
              </p>
            ) : null}
            {favoriteItems.map((item) => (
              <SidebarLink
                key={`favorite:${item.href}`}
                item={item}
                pathname={pathname}
                compact={compact}
                badge={badgeCounts[item.href]}
                onClick={mobile ? onCloseMobile : undefined}
              />
            ))}
          </div>
        ) : null}
        <div className="space-y-1">
          {!compact ? (
            <p className="px-3 pb-1 pt-2 text-xs font-black tracking-wide text-[var(--tenant-sidebar-foreground)] opacity-60">
              التشغيل اليومي
            </p>
          ) : null}
          {primaryItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              pathname={pathname}
              compact={compact}
              badge={badgeCounts[item.href]}
              onClick={mobile ? onCloseMobile : undefined}
            />
          ))}
        </div>
        {!compact ? <div className="mx-3 border-t border-[var(--tenant-border)] opacity-60" /> : null}
        {groups.map((group) => {
          const open = openGroups[group.key] ?? false;
          const groupActive = group.items.some(
            (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
          );
          if (compact) {
            const GroupIcon = group.icon;
            return (
              <div key={group.key} className="group/flyout relative mx-auto h-11 w-11">
                <button
                  type="button"
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-lg text-[var(--tenant-sidebar-foreground)] transition-colors hover:bg-[var(--tenant-sidebar-hover)]",
                    groupActive && "bg-[var(--tenant-sidebar-active)] text-[var(--tenant-sidebar-active-foreground)]",
                  )}
                  aria-label={group.label}
                >
                  <GroupIcon className="h-4 w-4" />
                </button>
                <div className="invisible absolute right-full top-0 z-50 mr-2 w-60 translate-x-2 rounded-xl border border-[var(--tenant-border)] bg-[var(--tenant-sidebar)] p-2 opacity-0 shadow-2xl transition-all group-hover/flyout:visible group-hover/flyout:translate-x-0 group-hover/flyout:opacity-100 group-focus-within/flyout:visible group-focus-within/flyout:translate-x-0 group-focus-within/flyout:opacity-100">
                  <p className="px-3 py-2 text-xs font-black text-[var(--tenant-sidebar-foreground)] opacity-70">
                    {group.label}
                  </p>
                  {group.items.map((item) => (
                    <SidebarLink
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      compact={false}
                      badge={badgeCounts[item.href]}
                    />
                  ))}
                </div>
              </div>
            );
          }
          return (
            <div key={group.key} className="space-y-1">
              <button
                type="button"
                onClick={() => onToggleGroup(group.key)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold leading-6 tracking-wide text-[var(--tenant-sidebar-foreground)] transition-colors hover:bg-[var(--tenant-sidebar-hover)]",
                  groupActive && "text-[var(--tenant-sidebar-active-foreground)]",
                )}
              >
                <span className="flex items-center gap-2.5">
                  <group.icon className="h-4 w-4" />
                  {group.label}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    open && "rotate-180",
                  )}
                />
              </button>
              {open
                ? group.items.map((item) => {
                    return (
                      <SidebarLink
                        key={item.href}
                        item={item}
                        pathname={pathname}
                        compact={false}
                        badge={badgeCounts[item.href]}
                        onClick={mobile ? onCloseMobile : undefined}
                      />
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

function SidebarLink({
  item,
  pathname,
  compact,
  badge,
  onClick,
}: {
  item: AdminNavItem;
  pathname: string;
  compact: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={compact ? item.label : undefined}
      className={cn(
        "group relative flex items-center rounded-lg py-2.5 text-sm font-semibold leading-6 transition-all",
        compact ? "mx-auto h-11 w-11 justify-center px-0" : "gap-3 px-3",
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
          active ? "bg-white/15" : "bg-[var(--tenant-sidebar-hover)]",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      {!compact ? <span className="truncate">{item.label}</span> : null}
      {badge ? (
        <span
          className={cn(
            "rounded-full bg-red-500 px-1.5 text-[10px] font-black leading-5 text-white",
            compact && "absolute -left-1 -top-1 min-w-5 text-center",
          )}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}
