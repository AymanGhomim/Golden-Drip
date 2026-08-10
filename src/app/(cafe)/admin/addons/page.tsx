"use client";
import { useState } from "react";
import { Check, ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Group = {
  id: number;
  name: string;
  required: boolean;
  multiple: boolean;
  min: number;
  max: number;
  options: string[];
};
const initial: Group[] = [
  {
    id: 1,
    name: "نوع اللبن",
    required: false,
    multiple: false,
    min: 0,
    max: 1,
    options: ["عادي", "شوفان +20", "لوز +20"],
  },
  {
    id: 2,
    name: "الإضافات",
    required: false,
    multiple: true,
    min: 0,
    max: 3,
    options: ["Extra Shot +25", "كراميل +15", "فانيليا +10"],
  },
];
export default function AddonsPage() {
  const [groups, setGroups] = useState(initial);
  const [open, setOpen] = useState<number | null>(1);
  return (
    <AdminShell>
      <section dir="rtl" className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-accent">إدارة المنيو</p>
            <h1 className="mt-1 text-2xl font-black">الإضافات والخيارات</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              مجموعات الخيارات التي تظهر عند تخصيص المنتج.
            </p>
          </div>
          <Button
            type="button"
            className="h-10 rounded-lg"
            disabled
            title="إدارة الإضافات تحتاج نموذج بيانات متكامل"
          >
            <Plus className="ml-2 h-4 w-4" />
            إضافة مجموعة
          </Button>
        </div>
        <div className="space-y-3">
          {groups.map((group) => (
            <Card key={group.id} className="overflow-hidden rounded-xl">
              <CardContent className="p-0">
                <div className="flex items-center justify-between gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => setOpen(open === group.id ? null : group.id)}
                    className="flex items-center gap-3 text-right"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${open === group.id ? "rotate-180" : ""}`}
                    />
                    <div>
                      <h2 className="font-black">{group.name}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {group.options.length} خيارات ·{" "}
                        {group.multiple ? "اختيار متعدد" : "اختيار واحد"} ·{" "}
                        {group.required ? "مطلوب" : "اختياري"}
                      </p>
                    </div>
                  </button>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() =>
                        setGroups((current) =>
                          current.filter((item) => item.id !== group.id),
                        )
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {open === group.id ? (
                  <div className="border-t bg-muted/20 p-4">
                    <div className="mb-3 flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">
                        {group.required ? "مطلوب" : "اختياري"}
                      </Badge>
                      <Badge variant="outline">الحد الأدنى: {group.min}</Badge>
                      <Badge variant="outline">الحد الأقصى: {group.max}</Badge>
                      <Badge variant="outline">
                        {group.multiple ? "متعدد" : "واحد"}
                      </Badge>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {group.options.map((option) => (
                        <div
                          key={option}
                          className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm"
                        >
                          <span>{option}</span>
                          <Check className="h-4 w-4 text-emerald-600" />
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3 h-9 rounded-lg text-xs"
                      disabled
                    >
                      <Plus className="ml-1 h-3.5 w-3.5" />
                      إضافة Option
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
