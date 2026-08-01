"use client";

import { AdminDataPage } from "@/components/admin/admin-data-page";
import { Badge } from "@/components/ui/badge";
import { mockCategories } from "@/mocks/categories.mock";
import { mockProducts } from "@/mocks/products.mock";
import { useAdminLocale } from "@/providers/admin-locale-provider";
import type { Category } from "@/types/category.types";

export default function CategoriesPage() {
  const { locale } = useAdminLocale();
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
      stats={[
        { label: text.total, value: mockCategories.length },
        { label: text.visible, value: mockCategories.filter((category) => category.isActive).length },
        { label: text.linked, value: mockProducts.length },
        { label: text.first, value: mockCategories[0]?.name ?? "-" },
      ]}
      tableTitle={text.tableTitle}
      tableDescription={text.tableDescription}
      columns={columns}
      data={mockCategories}
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
