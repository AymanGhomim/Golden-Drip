import { PentaAttributionFooter } from "@/components/customer/penta-attribution-footer";
import { CustomerThemeLock } from "@/components/customer/customer-theme-lock";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <CustomerThemeLock />
      <div className="flex-1">{children}</div>
      <PentaAttributionFooter />
    </div>
  );
}
