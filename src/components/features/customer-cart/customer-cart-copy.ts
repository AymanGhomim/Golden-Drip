import type { Locale } from "@/lib/menu-translations";

export const customerCartCopy = {
  en: {
    title: "Your cart",
    subtitle: "Review your drinks and offers before sending the order.",
    empty: "Your cart is empty",
    emptyText: "Add a drink or offer from the menu to see it here.",
    browse: "Browse menu",
    payment: "Payment method",
    total: "Total",
    subtotal: "Subtotal",
    items: "Items",
    checkout: "Place order",
    remove: "Remove",
    cash: "Cash",
    instapay: "InstaPay",
    summary: "Order summary",
  },
  ar: {
    title: "سلة الطلبات",
    subtitle: "راجع المشروبات والعروض قبل إرسال الطلب.",
    empty: "السلة فارغة",
    emptyText: "أضف مشروب أو عرض من المنيو وسيظهر هنا.",
    browse: "تصفح المنيو",
    payment: "طريقة الدفع",
    total: "الإجمالي",
    subtotal: "قيمة المنتجات",
    items: "العناصر",
    checkout: "إرسال الطلب",
    remove: "حذف",
    cash: "كاش",
    instapay: "إنستا باي",
    summary: "ملخص الطلب",
  },
} as const;

export function customerOrderCopy(locale: Locale) {
  return locale === "en"
    ? {
        orderType: "Order type",
        delivery: "Delivery",
        takeaway: "Take away",
        customerInfo: "Customer details",
        name: "Name",
        phone: "Phone number",
        address: "Delivery address",
        addressHint: "Street, building, floor, and nearby landmark",
        notes: "Notes",
        notesHint: "Anything we should know about your order",
        tablePrefix: "Table",
        tableFallback: "Scanned table",
      }
    : {
        orderType: "نوع الطلب",
        delivery: "دليفري",
        takeaway: "تيك أواي",
        customerInfo: "بيانات العميل",
        name: "الاسم",
        phone: "رقم الهاتف",
        address: "عنوان الدليفري",
        addressHint: "الشارع، العمارة، الدور، وأقرب علامة",
        notes: "ملاحظات",
        notesHint: "أي تفاصيل تحب تضيفها على الطلب",
        tablePrefix: "ترابيزة",
        tableFallback: "الترابيزة الممسوحة",
      };
}
