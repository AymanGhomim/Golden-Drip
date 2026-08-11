import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { AccessRequirement } from "@/auth/access";
import { canAccess } from "@/auth/access";
import { useAppSelector } from "@/store";

export function ProtectedRoute({ requirement = {} }: { requirement?: AccessRequirement }) {
  const session = useAppSelector((state) => state.auth.session);
  const location = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!canAccess(session, requirement)) return <Navigate to="/access-denied" replace />;
  return <Outlet />;
}

export function PermissionGate({ requirement = {}, children, fallback = null }: { requirement?: AccessRequirement; children: ReactNode; fallback?: ReactNode }) {
  const session = useAppSelector((state) => state.auth.session);
  return canAccess(session, requirement) ? children : fallback;
}
