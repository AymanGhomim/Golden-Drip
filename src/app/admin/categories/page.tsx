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
import { mockCategories } from "@/mocks/categories.mock";
import { mockProducts } from "@/mocks/products.mock";
import { useAdminLocale } from "@/providers/admin-locale-provider";
import type { Category } from "@/types/category.types";
import { Eye, EyeOff, Trash2, Plus } from "lucide-react";
import { useState } from "react";

export default function CategoriesPage() {
  const { locale } = useAdminLocale();
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const text =
    locale === "en"
      ? {
          eyebrow: "Golden Drip management",
          title: "Menu categories",
          description: "Organize the QR menu into clear drink categories for faster customer ordering.",
          add: "Add category",
          tableTitle: "Category list",
          tableDescription: "The sections customers use to browse the menu.",
          name: "Category",
          items: "Items",
          order: "Sort order",
          status: "Status",
          active: "Active",
          hidden: "Hidden",
          total: "Total categories",
          visible: "Visible",
          linked: "Linked items",
          first: "First section",
        }
      : {
          eyebrow: "إدارة جولدن دريب",
          title: "أقسام المنيو",
          description: "تنظيم منيو الـ QR إلى أقسام واضحة تساعد العميل يطلب بسرعة.",
          add: "إضافة قسم",
          tableTitle: "قائمة الأقسام",
          tableDescription: "الأقسام التي يستخدمها العميل لتصفح المنيو.",
          name: "القسم",
          items: "العناصر",
          order: "الترتيب",
          status: "الحالة",
          active: "نشط",
          hidden: "مخفي",
          total: "إجمالي الأقسام",
          visible: "ظاهر",
          linked: "عناصر مربوطة",
          first: "أول قسم",
        };

  const formText =
    locale === "en"
      ? {
          title: "Add category",
          description: "Create a new section for the customer menu.",
          image: "Image URL",
          placeholder: "Category name",
          cancel: "Cancel",
          save: "Save category",
        }
      : {
          title: "إضافة قسم",
          description: "أضف قسم جديد لتنظيم منيو العميل.",
          image: "رابط الصورة",
          placeholder: "اسم القسم",
          cancel: "إلغاء",
          save: "حفظ القسم",
        };

  const selectItemClassName = locale === "ar" ? "justify-end pl-2 pr-8 text-right [&>span]:left-auto [&>span]:right-2" : undefined;

  function saveCategory(formData: FormData) {
    const nextCategory: Category = {
      id: `cat-${Date.now()}`,
      name: String(formData.get("name") ?? ""),
      image: String(formData.get("image") ?? ""),
      sortOrder: Number(formData.get("sortOrder") ?? categories.length + 1),
      isActive: String(formData.get("isActive") ?? "active") === "active",
    };

    setCategories((current) => [nextCategory, ...current]);
    setIsAddDialogOpen(false);
  }

  function toggleCategoryStatus(categoryId: string) {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId ? { ...category, isActive: !category.isActive } : category
      )
    );
  }

  function deleteCategory(categoryId: string) {
    setCategories((current) => current.filter((category) => category.id !== categoryId));
  }

  const columns = [
    { key: "name", header: text.name, cell: (category: Category) => <span className="font-semibold">{category.name}</span> },
    {
      key: "items",
      header: text.items,
      cell: (category: Category) => mockProducts.filter((product) => product.categoryId === category.id).length,
    },
    { key: "order", header: text.order, cell: (category: Category) => category.sortOrder },
    {
      key: "status",
      header: text.status,
      cell: (category: Category) => (
        <Badge variant={category.isActive ? "default" : "secondary"}>
          {category.isActive ? text.active : text.hidden}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: locale === "en" ? "Actions" : "الإجراءات",
      headerClassName: "w-[96px] text-center",
      cellClassName: "w-[96px]",
      cell: (category: Category) => {
        const StatusIcon = category.isActive ? EyeOff : Eye;

        return (
          <div className="flex justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 border-amber-300/60 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              onClick={() => toggleCategoryStatus(category.id)}
              aria-label={category.isActive ? text.hidden : text.active}
              title={category.isActive ? text.hidden : text.active}
            >
              <StatusIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => deleteCategory(category.id)}
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
          search: "Search categories",
          all: "All categories",
          filter: "Filter",
          noResults: "No categories found",
          noResultsDescription: "Try another search or filter.",
        }
      : {
          search: "ابحث في الأقسام",
          all: "كل الأقسام",
          filter: "تصفية",
          noResults: "لا توجد أقسام",
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
                saveCategory(new FormData(event.currentTarget));
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category-name">{text.name}</Label>
                  <Input id="category-name" name="name" placeholder={formText.placeholder} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-order">{text.order}</Label>
                  <Input id="category-order" name="sortOrder" type="number" min="1" defaultValue={categories.length + 1} required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category-image">{formText.image}</Label>
                  <Input id="category-image" name="image" type="url" />
                </div>
                <div className="space-y-2">
                  <Label>{text.status}</Label>
                  <Select name="isActive" defaultValue="active">
                    <SelectTrigger className={locale === "ar" ? "flex-row-reverse" : undefined}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir={locale === "ar" ? "rtl" : "ltr"}>
                      <SelectItem value="active" className={selectItemClassName}>{text.active}</SelectItem>
                      <SelectItem value="hidden" className={selectItemClassName}>{text.hidden}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
        { label: text.total, value: categories.length },
        { label: text.visible, value: categories.filter((category) => category.isActive).length },
        { label: text.linked, value: mockProducts.length },
        { label: text.first, value: categories[0]?.name ?? "-" },
      ]}
      tableTitle={text.tableTitle}
      tableDescription={text.tableDescription}
      columns={columns}
      data={categories}
      keyExtractor={(category) => category.id}
      searchPlaceholder={controlsText.search}
      searchValue={(category) => category.name}
      filterLabel={controlsText.filter}
      allFilterLabel={controlsText.all}
      filterOptions={[
        {
          label: text.active,
          value: "active",
          predicate: (category) => category.isActive,
        },
        {
          label: text.hidden,
          value: "hidden",
          predicate: (category) => !category.isActive,
        },
      ]}
      emptyMessage={controlsText.noResults}
      emptyDescription={controlsText.noResultsDescription}
    />
  );
}
