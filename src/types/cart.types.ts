export type CartItem = {
  cartId?: string;
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
  selectedModifiers?: {
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    priceAdjustment: number;
  }[];
};
