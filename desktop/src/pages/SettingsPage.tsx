import { PrinterSettings } from "@/components/features/settings/printer/PrinterSettings";
import { Page, PageTitle, Panel } from "@/components/shared/PageLayout";
import { useAppSelector } from "@/store";

const settingLabels: Record<string, string> = {
  currency: "العملة",
  currencySymbol: "رمز العملة",
  timezone: "المنطقة الزمنية",
  locale: "اللغة",
  taxRate: "نسبة الضريبة",
};

export function SettingsPage() {
  const session = useAppSelector((state) => state.auth.session);
  if (!session) return null;
  return (
    <Page>
      <PageTitle eyebrow="إدارة الكافيه" title="الإعدادات" description="إعدادات الكافيه المشتركة وإعدادات هذا الكمبيوتر المحلية." />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PrinterSettings />
        <Panel title="إعدادات الكافيه">
          {Object.entries(session.tenant.settings).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4 border-b border-[var(--brand-border)] py-2 text-sm last:border-0">
              <span className="text-[var(--brand-muted)]">{settingLabels[key] ?? key}</span>
              <b>{String(value)}</b>
            </div>
          ))}
        </Panel>
      </div>
    </Page>
  );
}
