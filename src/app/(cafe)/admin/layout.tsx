import { AdminAreaLayout } from "@/components/admin/admin-area-layout";

export const metadata = {
  title: "لوحة إدارة الكافيه",
  description: "إدارة الفروع والمبيعات والمنيو والتشغيل",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminAreaLayout>{children}</AdminAreaLayout>;
}
