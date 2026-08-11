export const orderStatusPresentation = {
  NEW: { label: "جديد", tone: "sky" },
  ACCEPTED: { label: "مقبول", tone: "indigo" },
  PREPARING: { label: "جاري التحضير", tone: "amber" },
  READY: { label: "جاهز", tone: "emerald" },
  COMPLETED: { label: "مكتمل", tone: "stone" },
  CANCELLED: { label: "ملغي", tone: "red" },
  REFUNDED: { label: "مسترجع", tone: "red" },
} as const;

export const orderSourceLabels = {
  POS: "نقطة البيع",
  QR_MENU: "QR",
  ONLINE_MENU: "المنيو الإلكتروني",
  MANUAL: "طلب يدوي",
} as const;

export const orderTypeLabels = {
  TABLE: "داخل الكافيه",
  TAKEAWAY: "تيك أواي",
  DELIVERY: "توصيل",
} as const;

export const paymentStatusLabels = {
  PENDING: "قيد الانتظار",
  PAID: "مدفوع",
  FAILED: "فشل الدفع",
  PARTIALLY_REFUNDED: "مسترجع جزئيًا",
  REFUNDED: "مسترجع",
} as const;

export const paymentMethodLabels = {
  CASH: "نقدي",
  CARD: "بطاقة",
  WALLET: "محفظة",
  ONLINE: "دفع إلكتروني",
  MIXED: "دفع مختلط",
} as const;
