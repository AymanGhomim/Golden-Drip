export const ORDER_STATUS = {
  NEW: "NEW",
  PREPARING: "PREPARING",
  READY: "READY",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  NEW: "جديد",
  PREPARING: "جاري التحضير",
  READY: "جاهز",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800 border-blue-200",
  PREPARING: "bg-amber-100 text-amber-800 border-amber-200",
  READY: "bg-emerald-100 text-emerald-800 border-emerald-200",
  COMPLETED: "bg-slate-100 text-slate-800 border-slate-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};
