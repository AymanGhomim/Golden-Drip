import { ROUTES } from "@/constants/routes";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  ClipboardList,
  Table,
  ChefHat,
  LogOut,
} from "lucide-react";

export type NavigationItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const adminNavigation: NavigationItem[] = [
  {
    title: "لوحة التحكم",
    href: ROUTES.admin.dashboard,
    icon: LayoutDashboard,
  },
  {
    title: "المنتجات",
    href: ROUTES.admin.products,
    icon: UtensilsCrossed,
  },
  {
    title: "الأقسام",
    href: ROUTES.admin.categories,
    icon: Tags,
  },
  {
    title: "الطلبات",
    href: ROUTES.admin.orders,
    icon: ClipboardList,
  },
  {
    title: "الترابيزات",
    href: ROUTES.admin.tables,
    icon: Table,
  },
  {
    title: "المطبخ",
    href: ROUTES.kitchen.orders,
    icon: ChefHat,
  },
];

export const adminBottomNavigation: NavigationItem[] = [
  {
    title: "تسجيل الخروج",
    href: ROUTES.admin.login,
    icon: LogOut,
  },
];
