import { BranchProvider } from "@/providers/branch-provider";
import { TenantProvider } from "@/providers/tenant-provider";
import { TenantThemeProvider } from "@/providers/tenant-theme-provider";
import { CurrentEmployeeProvider } from "@/providers/current-employee-provider";
import { CustomerRouteProvider } from "@/providers/customer-route-provider";

export default function CafeLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerRouteProvider>
      <TenantProvider>
        <TenantThemeProvider>
          <CurrentEmployeeProvider>
            <BranchProvider>{children}</BranchProvider>
          </CurrentEmployeeProvider>
        </TenantThemeProvider>
      </TenantProvider>
    </CustomerRouteProvider>
  );
}
