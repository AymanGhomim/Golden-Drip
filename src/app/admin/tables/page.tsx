"use client";

import { AdminDataPage } from "@/components/admin/admin-data-page";
import { Badge } from "@/components/ui/badge";
import { mockTables } from "@/mocks/tables.mock";
import { useAdminLocale } from "@/providers/admin-locale-provider";
import type { Table } from "@/types/table.types";

export default function TablesPage() {
  const { locale } = useAdminLocale();
  const text =
    locale === "en"
      ? {
          eyebrow: "Golden Drip management",
          title: "QR tables",
          description: "Manage table QR codes so every customer order is attached to the correct table.",
          add: "Add table",
          tableTitle: "Table QR list",
          tableDescription: "Each QR code identifies the table when customers place orders.",
          table: "Table",
          qr: "QR code",
          status: "Status",
          active: "Active",
          disabled: "Disabled",
          total: "Total tables",
          linked: "Linked QR codes",
          available: "Active tables",
          range: "Table range",
        }
      : {
          eyebrow: "إدارة جولدن دريب",
          title: "ترابيزات QR",
          description: "إدارة أكواد QR لكل ترابيزة عشان كل طلب يوصل برقم الترابيزة الصحيح.",
          add: "إضافة ترابيزة",
          tableTitle: "قائمة QR الترابيزات",
          tableDescription: "كل QR يحدد الترابيزة عند إرسال طلب العميل.",
          table: "الترابيزة",
          qr: "كود QR",
          status: "الحالة",
          active: "نشطة",
          disabled: "متوقفة",
          total: "إجمالي الترابيزات",
          linked: "أكواد مربوطة",
          available: "ترابيزات نشطة",
          range: "نطاق الترابيزات",
        };

  const columns = [
    { key: "table", header: text.table, cell: (table: Table) => <span className="font-semibold">#{table.number}</span> },
    { key: "qr", header: text.qr, cell: (table: Table) => <code className="rounded bg-muted px-2 py-1 text-xs">{table.qrCode}</code> },
    {
      key: "status",
      header: text.status,
      cell: (table: Table) => (
        <Badge variant={table.isActive ? "default" : "secondary"}>
          {table.isActive ? text.active : text.disabled}
        </Badge>
      ),
    },
  ];

  return (
    <AdminDataPage
      eyebrow={text.eyebrow}
      title={text.title}
      description={text.description}
      actionLabel={text.add}
      stats={[
        { label: text.total, value: mockTables.length },
        { label: text.linked, value: mockTables.filter((table) => table.qrCode).length },
        { label: text.available, value: mockTables.filter((table) => table.isActive).length },
        { label: text.range, value: `1-${mockTables.length}` },
      ]}
      tableTitle={text.tableTitle}
      tableDescription={text.tableDescription}
      columns={columns}
      data={mockTables}
      keyExtractor={(table) => table.id}
    />
  );
}
