import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function Page({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-[1500px]" dir="rtl">
      {children}
    </section>
  );
}

export function PageTitle({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-3 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-sm lg:flex-row lg:items-end">
      <div>
        <p className="text-xs font-bold text-[var(--brand-accent)]">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-black">{title}</h1>
        <p className="mt-1 text-sm text-[var(--brand-muted)]">{description}</p>
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-sm ${className}`}
    >
      {title ? <h2 className="mb-4 text-lg font-black">{title}</h2> : null}
      {children}
    </section>
  );
}

export function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <Panel title="">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--brand-muted)]">{label}</p>
          <p className="mt-2 text-2xl font-black">{value}</p>
        </div>
        <Icon className="h-5 w-5 text-[var(--brand-accent)]" />
      </div>
    </Panel>
  );
}

export function PrimaryLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link
      className="flex h-10 items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-4 text-sm font-bold text-white"
      to={to}
    >
      {children}
    </Link>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 items-center gap-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 text-sm font-bold disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${active ? "bg-[var(--brand-primary)] text-white" : "bg-black/5 text-[var(--brand-muted)] hover:bg-black/10"}`}
    >
      {children}
    </button>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="p-10 text-center text-sm text-[var(--brand-muted)]">
      {children}
    </p>
  );
}

export function Info({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 border-b border-[var(--brand-border)] py-2 last:border-0 ${strong ? "text-lg font-black" : "text-sm"}`}
    >
      <span className="text-[var(--brand-muted)]">{label}</span>
      <span className={strong ? "" : "font-bold"}>{value}</span>
    </div>
  );
}
