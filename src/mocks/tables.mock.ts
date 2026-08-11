import { Table } from "@/types/table.types";
import { getMockTenantId } from "@/mocks/mock-tenant-context";

export const goldenTables: Table[] = [
  { id: "tbl-1", number: 1, qrCode: "qr-table-1", isActive: true },
  { id: "tbl-2", number: 2, qrCode: "qr-table-2", isActive: true },
  { id: "tbl-3", number: 3, qrCode: "qr-table-3", isActive: true },
  { id: "tbl-4", number: 4, qrCode: "qr-table-4", isActive: true },
  { id: "tbl-5", number: 5, qrCode: "qr-table-5", isActive: true },
  { id: "tbl-6", number: 6, qrCode: "qr-table-6", isActive: true },
  { id: "tbl-7", number: 7, qrCode: "qr-table-7", isActive: true },
  { id: "tbl-8", number: 8, qrCode: "qr-table-8", isActive: true },
  { id: "tbl-9", number: 9, qrCode: "qr-table-9", isActive: true },
  { id: "tbl-10", number: 10, qrCode: "qr-table-10", isActive: true },
];
const moonTables: Table[] = [{ id: "moon-tbl-1", number: 1, qrCode: "moon-qr-table-1", isActive: true }, { id: "moon-tbl-2", number: 2, qrCode: "moon-qr-table-2", isActive: true }, { id: "moon-tbl-3", number: 3, qrCode: "moon-qr-table-3", isActive: true }];
export const mockTables: Table[] = (getMockTenantId() === "tenant-golden-drip" ? goldenTables : getMockTenantId() === "tenant-moon-cafe" ? moonTables : []).map((item) => ({ ...item, tenantId: getMockTenantId() }));
