import { AdminSection } from "@/components/admin/admin-section";
import { mockRecentOrders } from "@/mocks/dashboard.mock";
export default function KitchenOrdersPage() { return <AdminSection title={["Kitchen orders", "طلبات المطبخ"]} description={["Follow preparation status for incoming drinks.", "متابعة حالة تحضير المشروبات الجديدة."]} count={mockRecentOrders.filter((order) => order.status !== "COMPLETED").length} label={["Orders in progress", "طلبات قيد التحضير"]} />; }
