export type Product = {
  id: string;
  tenantId?: string;
  modifierGroupIds?: string[];
  name: string;
  description: string;
  price: number;
  image?: string;
  categoryId: string;
  isAvailable: boolean;
};
