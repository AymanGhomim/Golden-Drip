"use client";

import { useState } from "react";
import { Eye, Pencil, Plus, Power, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { PermissionGate } from "@/components/access/permission-gate";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PERMISSION_DEFINITIONS } from "@/config/permissions.config";
import { useBranch } from "@/providers/branch-provider";
import { useTenant } from "@/providers/tenant-provider";
import { employeeService } from "@/services/employee.service";
import { roleService } from "@/services/role.service";
import type { BranchAccessMode, CafeEmployee, EmployeeStatus } from "@/types/access-control.types";

type FormState = {
  name: string; phone: string; email: string; username: string; roleId: string;
  branchAccess: BranchAccessMode; branchIds: string[]; status: EmployeeStatus; joinDate: string;
};

export default function EmployeesPage() {
  const { tenant } = useTenant();
  const { branches } = useBranch();
  const [revision, setRevision] = useState(0);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CafeEmployee | null>(null);
  const [viewing, setViewing] = useState<CafeEmployee | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<CafeEmployee | null>(null);
  void revision;
  const employees = employeeService.getEmployees(tenant.id);
  const roles = roleService.getRoles(tenant.id);
  const roleMap = new Map(roles.map((role) => [role.id, role]));
  const branchMap = new Map(branches.map((branch) => [branch.id, branch.name]));
  const filtered = employees.filter((employee) => `${employee.name} ${employee.phone} ${employee.email ?? ""} ${employee.username ?? ""} ${roleMap.get(employee.roleId)?.name ?? ""}`.toLowerCase().includes(query.toLowerCase()));

  const refresh = () => setRevision((value) => value + 1);
  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (employee: CafeEmployee) => { setEditing(employee); setFormOpen(true); };

  return (
    <AdminShell>
      <section dir="rtl" className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5">
        <div className="mb-5 flex flex-col justify-between gap-3 rounded-xl border bg-card p-5 shadow-sm sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold text-accent">الموظفون</p><h1 className="mt-1 text-2xl font-black">الموظفون</h1><p className="mt-1 text-sm text-muted-foreground">إدارة بيانات الموظفين وأدوارهم والفروع المسموح لهم بالعمل بها.</p></div>
          <PermissionGate permission="employees.create"><Button onClick={openCreate}><Plus className="ml-2 h-4 w-4" />إضافة موظف</Button></PermissionGate>
        </div>
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[["إجمالي الموظفين", employees.length], ["الموظفون النشطون", employees.filter((item) => item.status === "ACTIVE").length], ["الموظفون الموقوفون", employees.filter((item) => item.status === "SUSPENDED").length], ["عدد الأدوار", roles.length]].map(([label, value]) => <Card key={label as string}><CardContent className="p-4"><Users className="h-4 w-4 text-accent" /><p className="mt-3 text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></CardContent></Card>)}
        </div>
        <Card className="overflow-hidden"><CardContent className="p-0">
          <div className="border-b p-4"><div className="relative max-w-sm"><Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="بحث عن موظف..." className="pr-9" /></div></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-right text-sm"><thead className="bg-muted/50"><tr>{["الموظف", "الهاتف", "الدور", "الفروع", "الحالة", "تاريخ الانضمام", "الإجراءات"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody>
            {filtered.map((employee) => <tr key={employee.id} className="border-t"><td className="px-4 py-4"><p className="font-black">{employee.name}</p><p className="text-xs text-muted-foreground">{employee.email || employee.username || "—"}</p></td><td className="px-4 py-4">{employee.phone || "—"}</td><td className="px-4 py-4 font-bold">{roleMap.get(employee.roleId)?.name || "دور غير صالح"}</td><td className="px-4 py-4">{employee.branchAccess === "ALL" ? "كل الفروع" : employee.branchIds.map((id) => branchMap.get(id)).filter(Boolean).join("، ") || "—"}</td><td className="px-4 py-4"><Badge className={employee.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-700" : "bg-red-500/15 text-red-700"}>{employee.status === "ACTIVE" ? "نشط" : "موقوف"}</Badge></td><td className="px-4 py-4">{employee.joinDate ? new Date(employee.joinDate).toLocaleDateString("ar-EG") : "—"}</td><td className="px-4 py-4"><div className="flex gap-1"><Button variant="outline" size="icon" onClick={() => setViewing(employee)} aria-label="عرض"><Eye className="h-4 w-4" /></Button><PermissionGate permission="employees.update"><Button variant="outline" size="icon" onClick={() => openEdit(employee)} aria-label="تعديل"><Pencil className="h-4 w-4" /></Button></PermissionGate><PermissionGate permission="employees.suspend"><Button variant="outline" size="sm" onClick={() => setStatusTarget(employee)}><Power className="ml-1 h-4 w-4" />{employee.status === "ACTIVE" ? "إيقاف" : "تفعيل"}</Button></PermissionGate></div></td></tr>)}
          </tbody></table>{!filtered.length ? <div className="p-12 text-center text-sm text-muted-foreground">لا يوجد موظفون حتى الآن.</div> : null}</div>
        </CardContent></Card>
      </section>
      {formOpen ? <EmployeeForm open onOpenChange={setFormOpen} employee={editing} roles={roles} branches={branches} onSaved={refresh} /> : null}
      <EmployeeDetails employee={viewing} onOpenChange={(open) => !open && setViewing(null)} roleName={viewing ? roleMap.get(viewing.roleId)?.name : undefined} branchNames={viewing ? viewing.branchAccess === "ALL" ? ["كل الفروع"] : viewing.branchIds.map((id) => branchMap.get(id) ?? id) : []} />
      <ConfirmDialog open={Boolean(statusTarget)} onOpenChange={(open) => !open && setStatusTarget(null)} title={statusTarget?.status === "ACTIVE" ? "إيقاف الموظف" : "تفعيل الموظف"} description={statusTarget?.status === "ACTIVE" ? "هل أنت متأكد من إيقاف هذا الموظف؟ لن يتمكن من استخدام لوحة الكافيه." : "هل تريد إعادة تفعيل حساب هذا الموظف؟"} confirmLabel={statusTarget?.status === "ACTIVE" ? "إيقاف" : "تفعيل"} destructive={statusTarget?.status === "ACTIVE"} onConfirm={() => { if (!statusTarget) return; statusTarget.status === "ACTIVE" ? employeeService.suspendEmployee(statusTarget.id, tenant.id) : employeeService.activateEmployee(statusTarget.id, tenant.id); toast.success(statusTarget.status === "ACTIVE" ? "تم إيقاف الموظف" : "تم تفعيل الموظف"); setStatusTarget(null); refresh(); }} />
    </AdminShell>
  );
}

function EmployeeForm({ open, onOpenChange, employee, roles, branches, onSaved }: { open: boolean; onOpenChange: (open: boolean) => void; employee: CafeEmployee | null; roles: ReturnType<typeof roleService.getRoles>; branches: ReturnType<typeof employeeService.getAccessibleBranches>; onSaved: () => void }) {
  const { tenant } = useTenant();
  const initial = (): FormState => employee ? { name: employee.name, phone: employee.phone, email: employee.email ?? "", username: employee.username ?? "", roleId: employee.roleId, branchAccess: employee.branchAccess, branchIds: employee.branchIds, status: employee.status, joinDate: employee.joinDate ?? "" } : { name: "", phone: "", email: "", username: "", roleId: roles[0]?.id ?? "", branchAccess: "ALL", branchIds: [], status: "ACTIVE", joinDate: new Date().toISOString().slice(0, 10) };
  const [form, setForm] = useState<FormState>(initial);
  const reset = () => setForm(initial());
  const selectedRole = roles.find((role) => role.id === form.roleId);
  const save = () => { try { if (!form.name.trim() || !form.phone.trim()) throw new Error("اسم الموظف ورقم الهاتف مطلوبان."); employee ? employeeService.updateEmployee(employee.id, { ...form, name: form.name.trim(), phone: form.phone.trim() }, tenant.id) : employeeService.createEmployee({ ...form, name: form.name.trim(), phone: form.phone.trim() }, tenant.id); toast.success(employee ? "تم تحديث الموظف" : "تمت إضافة الموظف"); onOpenChange(false); onSaved(); } catch (error) { toast.error(error instanceof Error ? error.message : "تعذر حفظ الموظف."); } };
  return <Dialog open={open} onOpenChange={(value) => { onOpenChange(value); if (value) setTimeout(reset, 0); }}><DialogContent dir="rtl" className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>{employee ? "تعديل الموظف" : "إضافة موظف"}</DialogTitle><DialogDescription>الدور يحدد الصلاحيات، والفروع تحدد نطاق بيانات التشغيل المتاحة.</DialogDescription></DialogHeader><div className="grid gap-4 sm:grid-cols-2"><Field label="اسم الموظف *" value={form.name} onChange={(value) => setForm({ ...form, name: value })} /><Field label="رقم الهاتف *" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} /><Field label="البريد الإلكتروني" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} /><Field label="اسم المستخدم" value={form.username} onChange={(value) => setForm({ ...form, username: value })} /><label className="text-sm font-bold">الدور<select value={form.roleId} onChange={(event) => setForm({ ...form, roleId: event.target.value })} className="mt-2 h-10 w-full rounded-lg border bg-background px-3">{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label><label className="text-sm font-bold">الحالة<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EmployeeStatus })} className="mt-2 h-10 w-full rounded-lg border bg-background px-3"><option value="ACTIVE">نشط</option><option value="SUSPENDED">موقوف</option></select></label><Field label="تاريخ الانضمام" type="date" value={form.joinDate} onChange={(value) => setForm({ ...form, joinDate: value })} /></div><div className="rounded-xl border p-4"><p className="font-black">الفروع المسموحة</p><div className="mt-3 flex gap-4"><label className="flex items-center gap-2 text-sm"><input type="radio" checked={form.branchAccess === "ALL"} onChange={() => setForm({ ...form, branchAccess: "ALL", branchIds: [] })} />كل الفروع</label><label className="flex items-center gap-2 text-sm"><input type="radio" checked={form.branchAccess === "SELECTED"} onChange={() => setForm({ ...form, branchAccess: "SELECTED" })} />فروع محددة</label></div>{form.branchAccess === "SELECTED" ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{branches.map((branch) => <label key={branch.id} className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm"><input type="checkbox" checked={form.branchIds.includes(branch.id)} onChange={() => setForm({ ...form, branchIds: form.branchIds.includes(branch.id) ? form.branchIds.filter((id) => id !== branch.id) : [...form.branchIds, branch.id] })} />{branch.name}</label>)}</div> : null}</div>{selectedRole ? <div className="rounded-xl bg-muted/50 p-4"><p className="font-black">الصلاحيات الناتجة ({selectedRole.permissions.length})</p><div className="mt-3 flex flex-wrap gap-2">{selectedRole.permissions.slice(0, 12).map((key) => <Badge key={key} variant="secondary">{PERMISSION_DEFINITIONS.find((item) => item.key === key)?.label ?? key}</Badge>)}{selectedRole.permissions.length > 12 ? <Badge variant="outline">+{selectedRole.permissions.length - 12}</Badge> : null}</div></div> : null}<Button onClick={save}>حفظ الموظف</Button></DialogContent></Dialog>;
}

function EmployeeDetails({ employee, onOpenChange, roleName, branchNames }: { employee: CafeEmployee | null; onOpenChange: (open: boolean) => void; roleName?: string; branchNames: string[] }) { if (!employee) return null; const permissions = roleService.getEffectivePermissions(employee.roleId, employee.tenantId); return <Dialog open onOpenChange={onOpenChange}><DialogContent dir="rtl" className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>{employee.name}</DialogTitle><DialogDescription>تفاصيل الموظف والصلاحيات الفعلية الناتجة من دوره.</DialogDescription></DialogHeader><div className="grid gap-3 sm:grid-cols-2">{[["الهاتف", employee.phone], ["البريد الإلكتروني", employee.email || "—"], ["اسم المستخدم", employee.username || "—"], ["الدور", roleName || "—"], ["الحالة", employee.status === "ACTIVE" ? "نشط" : "موقوف"], ["الفروع المسموحة", branchNames.join("، ") || "—"], ["تاريخ الانضمام", employee.joinDate || "—"]].map(([label, value]) => <div key={label} className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-bold">{value}</p></div>)}</div><div><h3 className="font-black">الصلاحيات الفعلية</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{permissions.map((key) => <div key={key} className="rounded-lg bg-muted/50 p-3 text-sm">{PERMISSION_DEFINITIONS.find((item) => item.key === key)?.label ?? key}</div>)}</div></div></DialogContent></Dialog>; }
function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="text-sm font-bold">{label}<Input className="mt-2" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
