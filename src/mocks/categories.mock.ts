import { Category } from "@/types/category.types";
import { getMockTenantId } from "@/mocks/mock-tenant-context";

export const goldenCategories: Category[] = [
  { id: "cat-1", name: "Hot Coffee", image: "", sortOrder: 1, isActive: true },
  { id: "cat-2", name: "Iced Coffee", image: "", sortOrder: 2, isActive: true },
  { id: "cat-3", name: "Tea & Matcha", image: "", sortOrder: 3, isActive: true },
  { id: "cat-4", name: "Refreshers", image: "", sortOrder: 4, isActive: true },
  { id: "cat-5", name: "Frappe & Smoothies", image: "", sortOrder: 5, isActive: true },
  { id: "cat-6", name: "Golden Specials", image: "", sortOrder: 6, isActive: true },
];
const moonCategories: Category[] = [{ id: "moon-cat-1", name: "قهوة مختصة", image: "", sortOrder: 1, isActive: true }, { id: "moon-cat-2", name: "حلويات", image: "", sortOrder: 2, isActive: true }];
export const mockCategories: Category[] = (getMockTenantId() === "tenant-golden-drip" ? goldenCategories : getMockTenantId() === "tenant-moon-cafe" ? moonCategories : []).map((item) => ({ ...item, tenantId: getMockTenantId() }));
