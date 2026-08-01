export type Locale = "en" | "ar";

export const menuCopy = {
  en: {
    menu: "Menu", all: "All", add: "Add", switchLanguage: "العربية",
    payment: "Payment method", cash: "Cash", instapay: "InstaPay",
    quantity: "Quantity", addToCart: "Add to cart", productDetails: "Product details",
  },
  ar: {
    menu: "القائمة", all: "الكل", add: "إضافة", switchLanguage: "English",
    payment: "طريقة الدفع", cash: "كاش", instapay: "إنستا باي",
    quantity: "الكمية", addToCart: "أضف إلى السلة", productDetails: "تفاصيل المنتج",
  },
} as const;

const categoryNames = {
  "cat-1": ["Hot Coffee", "قهوة ساخنة"], "cat-2": ["Iced Coffee", "قهوة باردة"],
  "cat-3": ["Tea & Matcha", "شاي وماتشا"], "cat-4": ["Refreshers", "مشروبات منعشة"],
  "cat-5": ["Frappe & Smoothies", "فرابيه وسموثي"], "cat-6": ["Golden Specials", "مشروبات جولدن الخاصة"],
} as const;

const productText = {
  "prod-1": ["Espresso", "Double-shot espresso made from freshly ground Arabica beans.", "إسبريسو", "شوتان من إسبرسو أرابيكا مطحون طازجًا."],
  "prod-2": ["Americano", "Double espresso gently lengthened with hot filtered water.", "أمريكانو", "إسبريسو مزدوج مع ماء ساخن مفلتر."],
  "prod-3": ["Cappuccino", "Espresso, steamed whole milk, and a thick layer of silky milk foam.", "كابتشينو", "إسبريسو وحليب مبخر وطبقة رغوة حليب ناعمة."],
  "prod-4": ["Flat White", "Double ristretto with velvety micro-foamed milk.", "فلات وايت", "ريستريتو مزدوج مع حليب ميكروفوم كريمي."],
  "prod-5": ["Iced Latte", "Double espresso, chilled milk, ice cubes, and optional vanilla syrup.", "آيس لاتيه", "إسبريسو مزدوج وحليب بارد وثلج مع إمكانية إضافة فانيليا."],
  "prod-6": ["Spanish Iced Latte", "Espresso, creamy milk, condensed milk, and ice for a rich sweet finish.", "آيس لاتيه إسباني", "إسبريسو وحليب كريمي وحليب مكثف وثلج."],
  "prod-7": ["Iced Caramel Macchiato", "Vanilla syrup, milk, ice, espresso shots, and caramel drizzle.", "آيس كراميل ماكياتو", "فانيليا وحليب وثلج وشوتات إسبريسو وصوص كراميل."],
  "prod-8": ["Cold Brew", "Arabica coffee slow-steeped for 16 hours, served over ice.", "كولد برو", "قهوة أرابيكا منقوعة ببطء لمدة 16 ساعة وتقدم مع الثلج."],
  "prod-9": ["Matcha Latte", "Ceremonial matcha powder whisked with milk and a light touch of vanilla.", "ماتشا لاتيه", "ماتشا احتفالية مخفوقة مع الحليب ولمسة فانيليا."],
  "prod-10": ["Iced Matcha", "Ceremonial matcha, chilled milk, ice, and vanilla syrup.", "آيس ماتشا", "ماتشا احتفالية وحليب بارد وثلج وسيروب فانيليا."],
  "prod-11": ["Moroccan Mint Tea", "Premium green tea leaves, fresh mint, and your choice of sweetness.", "شاي مغربي بالنعناع", "شاي أخضر فاخر ونعناع طازج مع مستوى الحلاوة الذي تختاره."],
  "prod-12": ["Chai Latte", "Black tea infused with cinnamon, cardamom, ginger, milk, and honey.", "شاي لاتيه", "شاي أسود بالقرفة والهيل والزنجبيل والحليب والعسل."],
  "prod-13": ["Fresh Lemon Mint", "Fresh lemon juice, muddled mint, cane sugar, sparkling water, and ice.", "ليمون ونعناع", "عصير ليمون طازج ونعناع وسكر قصب ومياه فوارة وثلج."],
  "prod-14": ["Mango Passion Refresher", "Mango puree, passion fruit, fresh lemon, sparkling water, and ice.", "مانجو باشن", "بيوريه مانجو وباشن فروت وليمون طازج ومياه فوارة وثلج."],
  "prod-15": ["Strawberry Mojito", "Fresh strawberries, lime, mint, sparkling water, cane sugar, and crushed ice.", "موهيتو فراولة", "فراولة طازجة ولايم ونعناع ومياه فوارة وسكر قصب وثلج مجروش."],
  "prod-16": ["Caramel Coffee Frappe", "Blended espresso, milk, ice, caramel sauce, and whipped cream.", "فرابيه قهوة كراميل", "إسبريسو مخلوط وحليب وثلج وصوص كراميل وكريمة مخفوقة."],
  "prod-17": ["Chocolate Frappe", "Belgian cocoa, milk, ice, chocolate sauce, and whipped cream.", "فرابيه شوكولاتة", "كاكاو بلجيكي وحليب وثلج وصوص شوكولاتة وكريمة مخفوقة."],
  "prod-18": ["Berry Smoothie", "Strawberries, blueberries, banana, yogurt, honey, and crushed ice.", "سموثي توت", "فراولة وتوت أزرق وموز وزبادي وعسل وثلج مجروش."],
  "prod-19": ["Golden Drip Signature", "Double espresso, date syrup, cinnamon, oat milk, and a delicate sesame crunch.", "جولدن دريب سيجنتشر", "إسبريسو مزدوج وسيروب تمر وقرفة وحليب شوفان ولمسة سمسم مقرمش."],
  "prod-20": ["Golden Hot Chocolate", "Belgian dark chocolate, steamed milk, vanilla, whipped cream, and cocoa dust.", "هوت شوكليت جولدن", "شوكولاتة بلجيكية داكنة وحليب مبخر وفانيليا وكريمة مخفوقة ورشة كاكاو."],
} as const;

export function translatedCategoryName(id: string, locale: Locale) {
  const item = categoryNames[id as keyof typeof categoryNames];
  return item ? item[locale === "en" ? 0 : 1] : id;
}

export function translatedProduct(id: string, locale: Locale) {
  const item = productText[id as keyof typeof productText];
  if (!item) return { name: id, description: "" };
  return locale === "en"
    ? { name: item[0], description: item[1] }
    : { name: item[2], description: item[3] };
}
