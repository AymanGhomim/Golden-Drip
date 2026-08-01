import { AdminSection } from "@/components/admin/admin-section";
import { mockRecentOrders } from "@/mocks/dashboard.mock";
export default function OrdersPage() { return <AdminSection title={["Orders", "الطلبات"]} description={["Review and manage incoming customer orders.", "مراجعة وإدارة طلبات العملاء الواردة."]} count={mockRecentOrders.length} label={["Recent orders", "أحدث الطلبات"]} />; }
