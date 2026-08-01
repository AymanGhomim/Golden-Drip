import { AdminSection } from "@/components/admin/admin-section";
import { mockTables } from "@/mocks/tables.mock";

export default function TablesPage() {
  return (
    <AdminSection
      title={["QR tables", "ترابيزات QR"]}
      description={[
        "Manage table QR codes so every customer order is attached to the correct table.",
        "إدارة أكواد QR لكل ترابيزة عشان كل طلب يوصل برقم الترابيزة الصحيح.",
      ]}
      count={mockTables.length}
      label={["Linked tables", "ترابيزات مربوطة"]}
    />
  );
}
