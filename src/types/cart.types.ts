export type CartItem = {
  tenantId?: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  notes?: string;
  variantId?: string;
  variantName?: string;
  variantPrice?: number;
  addons?: { id: string; name: string; price: number }[];
};
