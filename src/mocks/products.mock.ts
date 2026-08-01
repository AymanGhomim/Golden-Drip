import { Product } from "@/types/product.types";

const coffeeImage = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800";
const icedCoffeeImage = "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800";
const teaImage = "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800";
const refresherImage = "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800";
const smoothieImage = "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800";

export const mockProducts: Product[] = [
  { id: "prod-1", name: "Espresso", description: "Double-shot espresso made from freshly ground Arabica beans.", price: 55, image: coffeeImage, categoryId: "cat-1", isAvailable: true },
  { id: "prod-2", name: "Americano", description: "Double espresso gently lengthened with hot filtered water.", price: 60, image: coffeeImage, categoryId: "cat-1", isAvailable: true },
  { id: "prod-3", name: "Cappuccino", description: "Espresso, steamed whole milk, and a thick layer of silky milk foam.", price: 75, image: coffeeImage, categoryId: "cat-1", isAvailable: true },
  { id: "prod-4", name: "Flat White", description: "Double ristretto with velvety micro-foamed milk.", price: 80, image: coffeeImage, categoryId: "cat-1", isAvailable: true },

  { id: "prod-5", name: "Iced Latte", description: "Double espresso, chilled milk, ice cubes, and optional vanilla syrup.", price: 85, image: icedCoffeeImage, categoryId: "cat-2", isAvailable: true },
  { id: "prod-6", name: "Spanish Iced Latte", description: "Espresso, creamy milk, condensed milk, and ice for a rich sweet finish.", price: 95, image: icedCoffeeImage, categoryId: "cat-2", isAvailable: true },
  { id: "prod-7", name: "Iced Caramel Macchiato", description: "Vanilla syrup, milk, ice, espresso shots, and caramel drizzle.", price: 105, image: icedCoffeeImage, categoryId: "cat-2", isAvailable: true },
  { id: "prod-8", name: "Cold Brew", description: "Arabica coffee slow-steeped for 16 hours, served over ice.", price: 90, image: icedCoffeeImage, categoryId: "cat-2", isAvailable: true },

  { id: "prod-9", name: "Matcha Latte", description: "Ceremonial matcha powder whisked with milk and a light touch of vanilla.", price: 95, image: teaImage, categoryId: "cat-3", isAvailable: true },
  { id: "prod-10", name: "Iced Matcha", description: "Ceremonial matcha, chilled milk, ice, and vanilla syrup.", price: 100, image: teaImage, categoryId: "cat-3", isAvailable: true },
  { id: "prod-11", name: "Moroccan Mint Tea", description: "Premium green tea leaves, fresh mint, and your choice of sweetness.", price: 50, image: teaImage, categoryId: "cat-3", isAvailable: true },
  { id: "prod-12", name: "Chai Latte", description: "Black tea infused with cinnamon, cardamom, ginger, milk, and honey.", price: 80, image: teaImage, categoryId: "cat-3", isAvailable: true },

  { id: "prod-13", name: "Fresh Lemon Mint", description: "Fresh lemon juice, muddled mint, cane sugar, sparkling water, and ice.", price: 70, image: refresherImage, categoryId: "cat-4", isAvailable: true },
  { id: "prod-14", name: "Mango Passion Refresher", description: "Mango puree, passion fruit, fresh lemon, sparkling water, and ice.", price: 85, image: refresherImage, categoryId: "cat-4", isAvailable: true },
  { id: "prod-15", name: "Strawberry Mojito", description: "Fresh strawberries, lime, mint, sparkling water, cane sugar, and crushed ice.", price: 85, image: refresherImage, categoryId: "cat-4", isAvailable: true },

  { id: "prod-16", name: "Caramel Coffee Frappe", description: "Blended espresso, milk, ice, caramel sauce, and whipped cream.", price: 115, image: smoothieImage, categoryId: "cat-5", isAvailable: true },
  { id: "prod-17", name: "Chocolate Frappe", description: "Belgian cocoa, milk, ice, chocolate sauce, and whipped cream.", price: 110, image: smoothieImage, categoryId: "cat-5", isAvailable: true },
  { id: "prod-18", name: "Berry Smoothie", description: "Strawberries, blueberries, banana, yogurt, honey, and crushed ice.", price: 105, image: smoothieImage, categoryId: "cat-5", isAvailable: true },

  { id: "prod-19", name: "Golden Drip Signature", description: "Double espresso, date syrup, cinnamon, oat milk, and a delicate sesame crunch.", price: 120, image: coffeeImage, categoryId: "cat-6", isAvailable: true },
  { id: "prod-20", name: "Golden Hot Chocolate", description: "Belgian dark chocolate, steamed milk, vanilla, whipped cream, and cocoa dust.", price: 95, image: coffeeImage, categoryId: "cat-6", isAvailable: true },
];
