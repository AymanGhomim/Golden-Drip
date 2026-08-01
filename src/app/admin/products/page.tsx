"use client";

import Image from "next/image";
import { Edit3, Eye, EyeOff, LinkIcon, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";

import { AdminDataPage } from "@/components/admin/admin-data-page";
import { Price } from "@/components/shared/price";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageInputMode, setImageInputMode] = useState<"url" | "upload">("url");
  const available = products.filter((product) => product.isAvailable).length;
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
          search: "Search products",
          all: "All products",
          filter: "Filter products",
          noResults: "No products found",
          noResultsDescription: "Try another search or filter.",
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
          search: "ابحث في المنتجات",
          all: "كل المنتجات",
          filter: "تصفية المنتجات",
          noResults: "لا توجد منتجات",
          noResultsDescription: "جرب بحث أو تصفية مختلفة.",
        };
  const formText =
    locale === "en"
      ? {
          title: "Add menu item",
          description: "Create a new product for the customer menu.",
          name: "Product name",
          image: "Image URL",
          imageModeUrl: "Link",
          imageModeUpload: "Upload",
          imageUpload: "Upload image",
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
          imageModeUrl: "لينك",
          imageModeUpload: "رفع",
          imageUpload: "رفع صورة",
          categoryPlaceholder: "اختر القسم",
          descriptionLabel: "الوصف",
          availability: "التوفر",
          cancel: "إلغاء",
          save: "حفظ الصنف",
        };
  const selectItemClassName = locale === "ar" ? "justify-end pl-2 pr-8 text-right [&>span]:left-auto [&>span]:right-2" : undefined;
  const actionText =
    locale === "en"
      ? {
          actions: "Actions",
          edit: "Edit",
          delete: "Delete",
          deactivate: "Deactivate",
          activate: "Activate",
          editTitle: "Edit menu item",
          editDescription: "Update this product information.",
        }
      : {
          actions: "الإجراءات",
          edit: "تعديل",
          delete: "حذف",
          deactivate: "إيقاف",
          activate: "تفعيل",
          editTitle: "تعديل الصنف",
          editDescription: "حدث بيانات هذا الصنف.",
        };

  const deleteDialogText =
    locale === "en"
      ? {
          title: "Delete menu item?",
          description: "This item will be removed from the products table.",
          confirm: "Delete item",
          cancel: "Cancel",
        }
      : {
          title: "تأكيد حذف الصنف",
          description: "سيتم حذف هذا الصنف من جدول المنتجات.",
          confirm: "حذف الصنف",
          cancel: "إلغاء",
        };

  function closeProductDialog() {
    setIsAddDialogOpen(false);
    setEditingProduct(null);
    setImageInputMode("url");
  }

  function toggleProductAvailability(productId: string) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, isAvailable: !product.isAvailable } : product
      )
    );
  }

  function deleteProduct(productId: string) {
    setProducts((current) => current.filter((product) => product.id !== productId));
  }

  function saveProduct(formData: FormData) {
    const file = formData.get("imageFile");
    const fileImage = file instanceof File && file.size > 0 ? URL.createObjectURL(file) : "";
    const imageUrl = String(formData.get("imageUrl") ?? "");
    const nextProduct: Product = {
      id: editingProduct?.id ?? `prod-${Date.now()}`,
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price") ?? 0),
      image: imageInputMode === "upload" ? fileImage || editingProduct?.image : imageUrl || editingProduct?.image,
      categoryId: String(formData.get("categoryId") ?? mockCategories[0]?.id ?? ""),
      isAvailable: String(formData.get("isAvailable") ?? "available") === "available",
    };

    setProducts((current) =>
      editingProduct
        ? current.map((product) => (product.id === editingProduct.id ? nextProduct : product))
        : [nextProduct, ...current]
    );
    closeProductDialog();
  }

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
    {
      key: "actions",
      header: actionText.actions,
      className: "text-right",
      cell: (product: Product) => {
        const AvailabilityIcon = product.isAvailable ? EyeOff : Eye;
        const availabilityClassName = product.isAvailable
          ? "h-8 w-8 border-amber-300/60 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-200/40 dark:text-amber-100 dark:hover:bg-amber-200/15"
          : "h-8 w-8 border-emerald-300/60 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-200/40 dark:text-emerald-100 dark:hover:bg-emerald-200/15";

        return (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setEditingProduct(product);
              setImageInputMode("url");
              setIsAddDialogOpen(true);
            }}
            aria-label={actionText.edit}
            title={actionText.edit}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={availabilityClassName}
            onClick={() => toggleProductAvailability(product.id)}
            aria-label={product.isAvailable ? actionText.deactivate : actionText.activate}
            title={product.isAvailable ? actionText.deactivate : actionText.activate}
          >
            <AvailabilityIcon className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                aria-label={actionText.delete}
                title={actionText.delete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className={locale === "ar" ? "text-right" : undefined}>
              <AlertDialogHeader>
                <AlertDialogTitle>{deleteDialogText.title}</AlertDialogTitle>
                <AlertDialogDescription>{deleteDialogText.description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className={locale === "ar" ? "sm:flex-row-reverse sm:space-x-reverse" : undefined}>
                <AlertDialogCancel>{deleteDialogText.cancel}</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deleteProduct(product.id)}
                >
                  {deleteDialogText.confirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        );
      },
    },
  ];

  return (
    <AdminDataPage
      eyebrow={text.eyebrow}
      title={text.title}
      description={text.description}
      actionLabel={text.add}
      actionContent={
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            if (open) {
              setIsAddDialogOpen(true);
            } else {
              closeProductDialog();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="h-9 gap-2 rounded-md px-3 text-sm shadow-sm"
              onClick={() => {
                setEditingProduct(null);
                setImageInputMode("url");
              }}
            >
              <Plus className="h-4 w-4" />
              {text.add}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[92vh] max-w-2xl overflow-hidden rounded-md p-0" dir={locale === "ar" ? "rtl" : "ltr"}>
            <DialogHeader className="px-6 pt-6">
              <DialogTitle>{editingProduct ? actionText.editTitle : formText.title}</DialogTitle>
              <DialogDescription>{editingProduct ? actionText.editDescription : formText.description}</DialogDescription>
            </DialogHeader>
            <form
              className="grid max-h-[calc(92vh-6rem)] gap-4 overflow-y-auto px-6 pb-6 pt-2"
              onSubmit={(event) => {
                event.preventDefault();
                saveProduct(new FormData(event.currentTarget));
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-name">{formText.name}</Label>
                  <Input id="product-name" name="name" defaultValue={editingProduct?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-price">{text.price}</Label>
                  <Input id="product-price" name="price" type="number" min="0" defaultValue={editingProduct?.price} required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{text.category}</Label>
                  <Select name="categoryId" defaultValue={editingProduct?.categoryId} required>
                    <SelectTrigger className={locale === "ar" ? "flex-row-reverse" : undefined}>
                      <SelectValue placeholder={formText.categoryPlaceholder} />
                    </SelectTrigger>
                    <SelectContent dir={locale === "ar" ? "rtl" : "ltr"}>
                      {mockCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className={selectItemClassName}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={imageInputMode === "url" ? "product-image-url" : "product-image-file"}>
                    {imageInputMode === "url" ? formText.image : formText.imageUpload}
                  </Label>
                  <div className="grid grid-cols-2 gap-2 rounded-md border bg-background p-1">
                    <Button
                      type="button"
                      variant={imageInputMode === "url" ? "default" : "ghost"}
                      className="h-9 gap-2 rounded-md text-xs"
                      onClick={() => setImageInputMode("url")}
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      {formText.imageModeUrl}
                    </Button>
                    <Button
                      type="button"
                      variant={imageInputMode === "upload" ? "default" : "ghost"}
                      className="h-9 gap-2 rounded-md text-xs"
                      onClick={() => setImageInputMode("upload")}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {formText.imageModeUpload}
                    </Button>
                  </div>
                  {imageInputMode === "url" ? (
                    <Input id="product-image-url" name="imageUrl" type="url" defaultValue={editingProduct?.image} />
                  ) : (
                    <Input id="product-image-file" name="imageFile" type="file" accept="image/*" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-description">{formText.descriptionLabel}</Label>
                <Textarea id="product-description" name="description" defaultValue={editingProduct?.description} required />
              </div>
              <div className="space-y-2">
                <Label>{formText.availability}</Label>
                <Select name="isAvailable" defaultValue={editingProduct?.isAvailable === false ? "hidden" : "available"}>
                  <SelectTrigger className={locale === "ar" ? "flex-row-reverse" : undefined}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={locale === "ar" ? "rtl" : "ltr"}>
                    <SelectItem value="available" className={selectItemClassName}>{text.active}</SelectItem>
                    <SelectItem value="hidden" className={selectItemClassName}>{text.hidden}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="sticky bottom-0 -mx-6 gap-2 border-t bg-background px-6 py-4 sm:gap-2">
                <Button type="button" variant="outline" onClick={closeProductDialog}>
                  {formText.cancel}
                </Button>
                <Button type="submit">{formText.save}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
      stats={[
        { label: text.total, value: products.length },
        { label: text.available, value: available },
        { label: text.categories, value: mockCategories.length },
        {
          label: text.avg,
          value: products.length
            ? Math.round(products.reduce((sum, product) => sum + product.price, 0) / products.length)
            : 0,
        },
      ]}
      tableTitle={text.tableTitle}
      tableDescription={text.tableDescription}
      columns={columns}
      data={products}
      keyExtractor={(product) => product.id}
      searchPlaceholder={text.search}
      searchValue={(product) => {
        const categoryName =
          mockCategories.find((category) => category.id === product.categoryId)?.name ?? "";

        return `${product.name} ${product.description} ${categoryName}`;
      }}
      filterLabel={text.filter}
      allFilterLabel={text.all}
      filterOptions={[
        {
          label: text.active,
          value: "available",
          predicate: (product) => product.isAvailable,
        },
        {
          label: text.hidden,
          value: "hidden",
          predicate: (product) => !product.isAvailable,
        },
        ...mockCategories.map((category) => ({
          label: category.name,
          value: category.id,
          predicate: (product: Product) => product.categoryId === category.id,
        })),
      ]}
      emptyMessage={text.noResults}
      emptyDescription={text.noResultsDescription}
    />
  );
}
