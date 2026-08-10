export type Offer = {
  id: string;
  tenantId?: string;
  title: string;
  description: string;
  image: string;
  originalPrice: number;
  price: number;
  isActive: boolean;
  sortOrder: number;
};
