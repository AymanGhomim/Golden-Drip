import { AdminSection } from "@/components/admin/admin-section";
import { mockTables } from "@/mocks/tables.mock";
export default function TablesPage() { return <AdminSection title={["Tables", "الطاولات"]} description={["Manage QR codes and table availability.", "إدارة أكواد QR وحالة الطاولات."]} count={mockTables.length} label={["Café tables", "طاولات الكافيه"]} />; }
