"use client";

import { AdminDataPage } from "@/components/admin/admin-data-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockTables } from "@/mocks/tables.mock";
import { useAdminLocale } from "@/providers/admin-locale-provider";
import type { Table } from "@/types/table.types";
import { Eye, EyeOff, Hash, Plus, QrCode, Table2, Trash2 } from "lucide-react";
import { useState } from "react";

export default function TablesPage() {
  const { locale } = useAdminLocale();
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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

  const formText =
    locale === "en"
      ? {
          title: "Add table",
          description: "Create a table QR record for customer orders.",
          number: "Table number",
          qr: "QR code",
          cancel: "Cancel",
          save: "Save table",
        }
      : {
          title: "إضافة ترابيزة",
          description: "أضف ترابيزة وكود QR خاص بها للطلبات.",
          number: "رقم الترابيزة",
          qr: "كود QR",
          cancel: "إلغاء",
          save: "حفظ الترابيزة",
        };
  const selectItemClassName = locale === "ar" ? "justify-end pl-2 pr-8 text-right [&>span]:left-auto [&>span]:right-2" : undefined;

  function saveTable(formData: FormData) {
    const number = Number(formData.get("number") ?? tables.length + 1);
    const nextTable: Table = {
      id: `tbl-${Date.now()}`,
      number,
      qrCode: String(formData.get("qrCode") ?? `qr-table-${number}`),
      isActive: String(formData.get("isActive") ?? "active") === "active",
    };

    setTables((current) => [nextTable, ...current]);
    setIsAddDialogOpen(false);
  }

  function toggleTableStatus(tableId: string) {
    setTables((current) =>
      current.map((table) =>
        table.id === tableId ? { ...table, isActive: !table.isActive } : table
      )
    );
  }

  function deleteTable(tableId: string) {
    setTables((current) => current.filter((table) => table.id !== tableId));
  }

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
    {
      key: "actions",
      header: locale === "en" ? "Actions" : "الإجراءات",
      headerClassName: "w-[96px] text-center",
      cellClassName: "w-[96px]",
      cell: (table: Table) => {
        const StatusIcon = table.isActive ? EyeOff : Eye;

        return (
          <div className="flex justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 border-amber-300/60 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              onClick={() => toggleTableStatus(table.id)}
              aria-label={table.isActive ? text.disabled : text.active}
              title={table.isActive ? text.disabled : text.active}
            >
              <StatusIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => deleteTable(table.id)}
              aria-label={locale === "en" ? "Delete" : "حذف"}
              title={locale === "en" ? "Delete" : "حذف"}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];
  const controlsText =
    locale === "en"
      ? {
          search: "Search tables",
          all: "All tables",
          filter: "Filter",
          noResults: "No tables found",
          noResultsDescription: "Try another search or filter.",
        }
      : {
          search: "ابحث في الترابيزات",
          all: "كل الترابيزات",
          filter: "تصفية",
          noResults: "لا توجد ترابيزات",
          noResultsDescription: "جرب بحث أو تصفية مختلفة.",
        };

  return (
    <AdminDataPage
      eyebrow={text.eyebrow}
      title={text.title}
      description={text.description}
      actionLabel={text.add}
      actionContent={
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-9 gap-2 rounded-md px-3 text-sm shadow-sm">
              <Plus className="h-4 w-4" />
              {text.add}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[92vh] max-w-2xl overflow-hidden rounded-md p-0" dir={locale === "ar" ? "rtl" : "ltr"}>
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>{formText.title}</DialogTitle>
              <DialogDescription>{formText.description}</DialogDescription>
            </DialogHeader>
            <form
              className="grid max-h-[calc(92vh-6rem)] gap-4 overflow-y-auto px-6 pb-6 pt-2"
              onSubmit={(event) => {
                event.preventDefault();
                saveTable(new FormData(event.currentTarget));
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="table-number">{formText.number}</Label>
                  <Input id="table-number" name="number" type="number" min="1" defaultValue={tables.length + 1} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="table-qr">{formText.qr}</Label>
                  <Input id="table-qr" name="qrCode" defaultValue={`qr-table-${tables.length + 1}`} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{text.status}</Label>
                <Select name="isActive" defaultValue="active">
                  <SelectTrigger className={locale === "ar" ? "flex-row-reverse" : undefined}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={locale === "ar" ? "rtl" : "ltr"}>
                    <SelectItem value="active" className={selectItemClassName}>{text.active}</SelectItem>
                    <SelectItem value="disabled" className={selectItemClassName}>{text.disabled}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="sticky bottom-0 -mx-6 gap-2 border-t bg-background px-6 py-4 sm:gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {formText.cancel}
                </Button>
                <Button type="submit">{formText.save}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
      stats={[
        { label: text.total, value: tables.length, icon: Table2 },
        { label: text.linked, value: tables.filter((table) => table.qrCode).length, icon: QrCode },
        { label: text.available, value: tables.filter((table) => table.isActive).length, icon: Eye },
        { label: text.range, value: `1-${Math.max(...tables.map((table) => table.number), 0)}`, icon: Hash },
      ]}
      tableTitle={text.tableTitle}
      tableDescription={text.tableDescription}
      columns={columns}
      data={tables}
      keyExtractor={(table) => table.id}
      searchPlaceholder={controlsText.search}
      searchValue={(table) => `${table.number} ${table.qrCode}`}
      filterLabel={controlsText.filter}
      allFilterLabel={controlsText.all}
      filterOptions={[
        {
          label: text.active,
          value: "active",
          predicate: (table) => table.isActive,
        },
        {
          label: text.disabled,
          value: "disabled",
          predicate: (table) => !table.isActive,
        },
      ]}
      emptyMessage={controlsText.noResults}
      emptyDescription={controlsText.noResultsDescription}
    />
  );
}
