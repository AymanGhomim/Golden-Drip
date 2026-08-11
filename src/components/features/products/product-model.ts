import type { Product } from "@/types/product.types";

export type ProductRow = Product & {
  cost: number;
  stock: number;
  online: boolean;
  pos: boolean;
};
export type ProductFormDraft = {
  name: string;
  description: string;
  sku: string;
  barcode: string;
  categoryId: string;
  price: string;
  cost: string;
  tax: string;
};

export const categoryNames: Record<string, string> = {
  "cat-1": "القهوة الساخنة",
  "cat-2": "القهوة الباردة",
  "cat-3": "الشاي والماتشا",
  "cat-4": "المشروبات المنعشة",
  "cat-5": "الفراپيه والسموذي",
  "cat-6": "العروض الخاصة",
};

export const productNames: Record<string, string> = {
  "prod-1": "إسبريسو",
  "prod-2": "أمريكانو",
  "prod-3": "كابتشينو",
  "prod-4": "فلات وايت",
  "prod-5": "آيس لاتيه",
  "prod-6": "سبانيش آيس لاتيه",
  "prod-7": "آيس كراميل ماكياتو",
  "prod-8": "كولد برو",
  "prod-9": "ماتشا لاتيه",
  "prod-10": "آيس ماتشا",
  "prod-11": "شاي بالنعناع",
  "prod-12": "تشاي لاتيه",
  "prod-13": "ليمون بالنعناع",
  "prod-14": "مانجو باشن",
  "prod-15": "موهيتو فراولة",
  "prod-16": "فرابيه كراميل",
  "prod-17": "فرابيه شوكولاتة",
  "prod-18": "سموذي توت",
  "prod-19": "جولدن دريب سيجنتشر",
  "prod-20": "هوت شوكولاتة",
};

export const toProductRows = (items: Product[]): ProductRow[] =>
  items.map((product, index) => ({
    ...product,
    cost: Math.round(product.price * 0.55),
    stock: index % 7 === 0 ? 3 : 20 + index,
    online: true,
    pos: true,
  }));
