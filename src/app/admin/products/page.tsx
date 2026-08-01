"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useState } from "react";

import { AdminDataPage } from "@/components/admin/admin-data-page";
import { Price } from "@/components/shared/price";
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
import { Textarea } from "@/components/ui/textarea";
import { mockCategories } from "@/mocks/categories.mock";
import { mockProducts } from "@/mocks/products.mock";
import { useAdminLocale } from "@/providers/admin-locale-provider";
import type { Product } from "@/types/product.types";

export default function ProductsPage() {
  const { locale } = useAdminLocale();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const available = mockProducts.filter((product) => product.isAvailable).length;
  const text =
    locale === "en"
      ? {
          eyebrow: "Golden Drip management",
          title: "Menu items",
          description: "Manage drinks, offer-ready items, prices, images, and availability shown to guests.",
          add: "Add item",
          tableTitle: "Menu item list",
          tableDescription: "Every product that customers can browse or add to their cart.",
          item: "Item",
          category: "Category",
          price: "Price",
          status: "Status",
          active: "Available",
          hidden: "Hidden",
          total: "Total items",
          available: "Available",
          categories: "Categories used",
          avg: "Average price",
        }
      : {
          eyebrow: "إدارة جولدن دريب",
          title: "عناصر المنيو",
          description: "إدارة المشروبات والعناصر المعروضة للعميل، مع الأسعار والصور وحالة التوفر.",
          add: "إضافة صنف",
          tableTitle: "قائمة عناصر المنيو",
          tableDescription: "كل المنتجات التي يمكن للعميل تصفحها أو إضافتها للسلة.",
          item: "الصنف",
          category: "القسم",
          price: "السعر",
          status: "الحالة",
          active: "متاح",
          hidden: "مخفي",
          total: "إجمالي العناصر",
          available: "متاح",
          categories: "أقسام مستخدمة",
          avg: "متوسط السعر",
        };
  const formText =
    locale === "en"
      ? {
          title: "Add menu item",
          description: "Create a new product for the customer menu.",
          name: "Product name",
          image: "Image URL",
          categoryPlaceholder: "Select category",
          descriptionLabel: "Description",
          availability: "Availability",
          cancel: "Cancel",
          save: "Save item",
        }
      : {
          title: "إضافة صنف",
          description: "أضف صنف جديد لمنيو العميل.",
          name: "اسم الصنف",
          image: "رابط الصورة",
          categoryPlaceholder: "اختر القسم",
          descriptionLabel: "الوصف",
          availability: "التوفر",
          cancel: "إلغاء",
          save: "حفظ الصنف",
        };

  const columns = [
    {
      key: "item",
      header: text.item,
      cell: (product: Product) => (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" />
            ) : null}
          </div>
          <div>
            <p className="font-semibold">{product.name}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{product.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: text.category,
      cell: (product: Product) =>
        mockCategories.find((category) => category.id === product.categoryId)?.name ?? product.categoryId,
    },
    {
      key: "price",
      header: text.price,
      cell: (product: Product) => <Price value={product.price} locale={locale} />,
    },
    {
      key: "status",
      header: text.status,
      cell: (product: Product) => (
        <Badge variant={product.isAvailable ? "default" : "secondary"}>
          {product.isAvailable ? text.active : text.hidden}
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
      actionContent={
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-9 gap-2 rounded-md px-3 text-sm shadow-sm">
              <Plus className="h-4 w-4" />
              {text.add}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-md">
            <DialogHeader>
              <DialogTitle>{formText.title}</DialogTitle>
              <DialogDescription>{formText.description}</DialogDescription>
            </DialogHeader>
            <form
              className="grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                setIsAddDialogOpen(false);
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-name">{formText.name}</Label>
                  <Input id="product-name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-price">{text.price}</Label>
                  <Input id="product-price" name="price" type="number" min="0" required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{text.category}</Label>
                  <Select name="categoryId" required>
                    <SelectTrigger>
                      <SelectValue placeholder={formText.categoryPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-image">{formText.image}</Label>
                  <Input id="product-image" name="image" type="url" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-description">{formText.descriptionLabel}</Label>
                <Textarea id="product-description" name="description" required />
              </div>
              <div className="space-y-2">
                <Label>{formText.availability}</Label>
                <Select name="isAvailable" defaultValue="available">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">{text.active}</SelectItem>
                    <SelectItem value="hidden">{text.hidden}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
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
        { label: text.total, value: mockProducts.length },
        { label: text.available, value: available },
        { label: text.categories, value: mockCategories.length },
        {
          label: text.avg,
          value: Math.round(mockProducts.reduce((sum, product) => sum + product.price, 0) / mockProducts.length),
        },
      ]}
      tableTitle={text.tableTitle}
      tableDescription={text.tableDescription}
      columns={columns}
      data={mockProducts}
      keyExtractor={(product) => product.id}
    />
  );
}
