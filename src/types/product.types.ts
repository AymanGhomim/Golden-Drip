export type Product = {
  id: string;
  tenantId?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  categoryId: string;
  isAvailable: boolean;
};
