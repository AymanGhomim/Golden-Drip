import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/Access";
import { AppShell } from "@/components/AppShell";
import { allNavigationItems, firstAccessibleRoute } from "@/navigation";
import { DashboardPage, KitchenPage, OrderDetailsPage, OrdersPage, PosPage } from "@/pages/OperationalPages";
import { LoginPage } from "@/pages/LoginPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AccessDeniedPage, ModuleDataPage } from "@/pages/StatePages";
import { useAppSelector } from "@/store";

function FirstRoute() {
  const session = useAppSelector((state) => state.auth.session);
  return <Navigate to={session ? firstAccessibleRoute(session) : "/login"} replace />;
}

export default function App() {
  const dataModules = allNavigationItems.filter((item) => !item.real);
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<FirstRoute />} />
            <Route element={<ProtectedRoute requirement={{ permission: "dashboard.view" }} />}><Route path="dashboard" element={<DashboardPage />} /></Route>
            <Route element={<ProtectedRoute requirement={{ permission: "pos.use", feature: "pos" }} />}><Route path="pos" element={<PosPage />} /></Route>
            <Route element={<ProtectedRoute requirement={{ permission: "orders.view", feature: "orders" }} />}><Route path="orders" element={<OrdersPage />} /><Route path="orders/:orderId" element={<OrderDetailsPage />} /></Route>
            <Route element={<ProtectedRoute requirement={{ permission: "kitchen.view", feature: "kitchen" }} />}><Route path="kitchen" element={<KitchenPage />} /></Route>
            <Route element={<ProtectedRoute requirement={{ permission: "settings.view" }} />}><Route path="settings" element={<SettingsPage />} /></Route>
            {dataModules.map((item) => <Route key={item.path} element={<ProtectedRoute requirement={{ permission: item.permission, feature: item.feature }} />}><Route path={item.path.slice(1)} element={<ModuleDataPage />} /></Route>)}
            <Route path="access-denied" element={<AccessDeniedPage />} />
          </Route>
        </Route>
        <Route path="*" element={<FirstRoute />} />
      </Routes>
    </HashRouter>
  );
}
