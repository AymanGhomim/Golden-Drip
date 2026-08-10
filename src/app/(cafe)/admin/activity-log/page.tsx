"use client";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cafeOperationsService } from "@/services/cafe-operations.service";
import type { AuditEntry } from "@/types/cafe-operations.types";
export default function ActivityLogPage() {
  const [records, setRecords] = useState<AuditEntry[]>([]);
  const [query, setQuery] = useState("");
  const [module, setModule] = useState("ALL");
  const [action, setAction] = useState("ALL");
  const [employee, setEmployee] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const reload = () =>
    setRecords(cafeOperationsService.get<AuditEntry>("auditLog"));
  useEffect(() => {
    reload();
    window.addEventListener("operations:changed", reload);
    return () => window.removeEventListener("operations:changed", reload);
  }, []);
  const filtered = useMemo(
    () =>
      records.filter(
        (r) =>
          (!query ||
            `${r.description} ${r.entityType ?? ""} ${r.entityId ?? ""}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (module === "ALL" || r.module === module) &&
          (action === "ALL" || r.action === action) &&
          (!employee || r.userId?.includes(employee)) &&
          (!from || r.createdAt >= `${from}T00:00:00`) &&
          (!to || r.createdAt <= `${to}T23:59:59`),
      ),
    [records, query, module, action, employee, from, to],
  );
  return (
    <AdminShell>
      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5"
      >
        <p className="text-xs font-bold text-accent">الإدارة</p>
        <h1 className="text-2xl font-black">سجل النشاط</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          سجل تشغيلي تراكمي للقراءة فقط؛ تنشئه الخدمات تلقائيًا.
        </p>
        <Card>
          <CardContent className="p-0">
            <div className="grid gap-2 border-b p-4 sm:grid-cols-2 lg:grid-cols-6">
              <Input
                placeholder="بحث"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Input
                placeholder="الموظف"
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
              />
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
              <select
                className="rounded border bg-background px-3"
                value={module}
                onChange={(e) => setModule(e.target.value)}
              >
                <option value="ALL">كل الوحدات</option>
                {Array.from(new Set(records.map((r) => r.module))).map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              <select
                className="rounded border bg-background px-3"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="ALL">كل الإجراءات</option>
                {Array.from(new Set(records.map((r) => r.action))).map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-right text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {[
                      "التاريخ",
                      "الموظف",
                      "الفرع",
                      "الوحدة",
                      "الإجراء",
                      "نوع الكيان",
                      "الوصف",
                    ].map((h) => (
                      <th key={h} className="px-4 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...filtered].reverse().map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-4 py-3">
                        {new Date(r.createdAt).toLocaleString("ar-EG")}
                      </td>
                      <td className="px-4 py-3">{r.userId ?? "النظام"}</td>
                      <td className="px-4 py-3">{r.branchId ?? "كل الفروع"}</td>
                      <td className="px-4 py-3">{r.module}</td>
                      <td className="px-4 py-3 font-bold">{r.action}</td>
                      <td className="px-4 py-3">{r.entityType ?? "—"}</td>
                      <td className="px-4 py-3">{r.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filtered.length ? (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  لا توجد سجلات نشاط مطابقة.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>
    </AdminShell>
  );
}
