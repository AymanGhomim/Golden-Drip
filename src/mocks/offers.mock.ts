import type { Offer } from "@/types/offer.types";
import { getMockTenantId } from "@/mocks/mock-tenant-context";

const goldenOffers: Offer[] = [
  {
    id: "offer-1",
    title: "Morning Coffee Combo",
    description: "Start your day with any hot coffee and a fresh bakery bite.",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200",
    originalPrice: 165,
    price: 120,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "offer-2",
    title: "Iced Drinks Weekend",
    description: "Cool down with selected iced coffee drinks all weekend.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1200",
    originalPrice: 195,
    price: 150,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "offer-3",
    title: "Golden Dessert Pair",
    description: "Pair your favorite drink with a rich dessert for a sweet finish.",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200",
    originalPrice: 175,
    price: 135,
    isActive: true,
    sortOrder: 3,
  },
];
const moonOffers: Offer[] = [{ id: "moon-offer-1", title: "باقة المساء", description: "قهوة اليوم مع قطعة حلوى", image: "", originalPrice: 160, price: 125, isActive: true, sortOrder: 1 }];
export const mockOffers: Offer[] = getMockTenantId() === "tenant-golden-drip" ? goldenOffers : getMockTenantId() === "tenant-moon-cafe" ? moonOffers : [];
