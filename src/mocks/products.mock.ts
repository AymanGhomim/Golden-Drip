import { Product } from "@/types/product.types";
import { getMockTenantId } from "@/mocks/mock-tenant-context";

const productImages = {
  espresso: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=800&auto=format&fit=crop",
  americano: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop",
  cappuccino: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&auto=format&fit=crop",
  flatWhite: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop",
  icedLatte: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop",
  spanishLatte: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&auto=format&fit=crop",
  caramelMacchiato: "https://images.unsplash.com/photo-1534687941688-651ccaafbff8?w=800&auto=format&fit=crop",
  coldBrew: "https://images.unsplash.com/photo-1527156231393-7023794f363c?w=800&auto=format&fit=crop",
  matchaLatte: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&auto=format&fit=crop",
  icedMatcha: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&auto=format&fit=crop",
  mintTea: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop",
  chaiLatte: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&auto=format&fit=crop",
  lemonMint: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&auto=format&fit=crop",
  mangoPassion: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&auto=format&fit=crop",
  strawberryMojito: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop",
  caramelFrappe: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop",
  chocolateFrappe: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=800&auto=format&fit=crop",
  berrySmoothie: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&auto=format&fit=crop",
  signature: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop",
  hotChocolate: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&auto=format&fit=crop",
};

export const goldenProducts: Product[] = [
  { id: "prod-1", name: "Espresso", description: "Double-shot espresso made from freshly ground Arabica beans.", price: 55, image: productImages.espresso, categoryId: "cat-1", isAvailable: true },
  { id: "prod-2", name: "Americano", description: "Double espresso gently lengthened with hot filtered water.", price: 60, image: productImages.americano, categoryId: "cat-1", isAvailable: true },
  { id: "prod-3", name: "Cappuccino", description: "Espresso, steamed whole milk, and a thick layer of silky milk foam.", price: 75, image: productImages.cappuccino, categoryId: "cat-1", isAvailable: true },
  { id: "prod-4", name: "Flat White", description: "Double ristretto with velvety micro-foamed milk.", price: 80, image: productImages.flatWhite, categoryId: "cat-1", isAvailable: true },

  { id: "prod-5", name: "Iced Latte", description: "Double espresso, chilled milk, ice cubes, and optional vanilla syrup.", price: 85, image: productImages.icedLatte, categoryId: "cat-2", isAvailable: true },
  { id: "prod-6", name: "Spanish Iced Latte", description: "Espresso, creamy milk, condensed milk, and ice for a rich sweet finish.", price: 95, image: productImages.spanishLatte, categoryId: "cat-2", isAvailable: true },
  { id: "prod-7", name: "Iced Caramel Macchiato", description: "Vanilla syrup, milk, ice, espresso shots, and caramel drizzle.", price: 105, image: productImages.caramelMacchiato, categoryId: "cat-2", isAvailable: true },
  { id: "prod-8", name: "Cold Brew", description: "Arabica coffee slow-steeped for 16 hours, served over ice.", price: 90, image: productImages.coldBrew, categoryId: "cat-2", isAvailable: true },

  { id: "prod-9", name: "Matcha Latte", description: "Ceremonial matcha powder whisked with milk and a light touch of vanilla.", price: 95, image: productImages.matchaLatte, categoryId: "cat-3", isAvailable: true },
  { id: "prod-10", name: "Iced Matcha", description: "Ceremonial matcha, chilled milk, ice, and vanilla syrup.", price: 100, image: productImages.icedMatcha, categoryId: "cat-3", isAvailable: true },
  { id: "prod-11", name: "Moroccan Mint Tea", description: "Premium green tea leaves, fresh mint, and your choice of sweetness.", price: 50, image: productImages.mintTea, categoryId: "cat-3", isAvailable: true },
  { id: "prod-12", name: "Chai Latte", description: "Black tea infused with cinnamon, cardamom, ginger, milk, and honey.", price: 80, image: productImages.chaiLatte, categoryId: "cat-3", isAvailable: true },

  { id: "prod-13", name: "Fresh Lemon Mint", description: "Fresh lemon juice, muddled mint, cane sugar, sparkling water, and ice.", price: 70, image: productImages.lemonMint, categoryId: "cat-4", isAvailable: true },
  { id: "prod-14", name: "Mango Passion Refresher", description: "Mango puree, passion fruit, fresh lemon, sparkling water, and ice.", price: 85, image: productImages.mangoPassion, categoryId: "cat-4", isAvailable: true },
  { id: "prod-15", name: "Strawberry Mojito", description: "Fresh strawberries, lime, mint, sparkling water, cane sugar, and crushed ice.", price: 85, image: productImages.strawberryMojito, categoryId: "cat-4", isAvailable: true },

  { id: "prod-16", name: "Caramel Coffee Frappe", description: "Blended espresso, milk, ice, caramel sauce, and whipped cream.", price: 115, image: productImages.caramelFrappe, categoryId: "cat-5", isAvailable: true },
  { id: "prod-17", name: "Chocolate Frappe", description: "Belgian cocoa, milk, ice, chocolate sauce, and whipped cream.", price: 110, image: productImages.chocolateFrappe, categoryId: "cat-5", isAvailable: true },
  { id: "prod-18", name: "Berry Smoothie", description: "Strawberries, blueberries, banana, yogurt, honey, and crushed ice.", price: 105, image: productImages.berrySmoothie, categoryId: "cat-5", isAvailable: true },

  { id: "prod-19", name: "Golden Drip Signature", description: "Double espresso, date syrup, cinnamon, oat milk, and a delicate sesame crunch.", price: 120, image: productImages.signature, categoryId: "cat-6", isAvailable: true },
  { id: "prod-20", name: "Golden Hot Chocolate", description: "Belgian dark chocolate, steamed milk, vanilla, whipped cream, and cocoa dust.", price: 95, image: productImages.hotChocolate, categoryId: "cat-6", isAvailable: true },
];
const moonProducts: Product[] = [{ id: "moon-prod-1", name: "لاتيه فانيليا", description: "إسبريسو مع حليب وفانيليا", price: 78, categoryId: "moon-cat-1", isAvailable: true }, { id: "moon-prod-2", name: "قهوة اليوم", description: "قهوة مقطرة حسب التحميص المتاح", price: 65, categoryId: "moon-cat-1", isAvailable: true }, { id: "moon-prod-3", name: "تشيز كيك التوت", description: "قطعة تشيز كيك مع صوص التوت", price: 110, categoryId: "moon-cat-2", isAvailable: true }];
export const mockProducts: Product[] = (getMockTenantId() === "tenant-golden-drip" ? goldenProducts : getMockTenantId() === "tenant-moon-cafe" ? moonProducts : []).map((item) => ({ ...item, tenantId: getMockTenantId() }));
