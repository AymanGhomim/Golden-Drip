import type {
  PrintReceiptResult,
  PrinterErrorCode,
  PrinterListState,
  PrinterResult,
} from "../../electron/printer-contract";

const unavailable = <T>(): PrinterResult<T> => ({
  success: false,
  code: "DESKTOP_API_UNAVAILABLE",
});

export const printerErrorMessages: Record<PrinterErrorCode, string> = {
  DESKTOP_API_UNAVAILABLE: "إعدادات الطابعة متاحة داخل تطبيق Penta-K Cafe Desktop فقط.",
  PRINTER_DISCOVERY_FAILED: "تعذر تحميل الطابعات المثبتة على Windows.",
  WINDOWS_PRINT_SERVICE_UNAVAILABLE: "خدمة الطباعة في Windows متوقفة أو غير متاحة. شغّل Print Spooler ثم أعد المحاولة.",
  INVALID_PRINTER: "الطابعة المحددة غير صالحة أو لم تعد مثبتة على هذا الجهاز.",
  NO_PRINTER_SELECTED: "لم يتم تحديد طابعة للفواتير.",
  SELECTED_PRINTER_UNAVAILABLE: "الطابعة المحفوظة غير متاحة على هذا الجهاز.",
  PRINT_IN_PROGRESS: "توجد عملية طباعة قيد التنفيذ بالفعل.",
  NO_RECEIPT: "لا توجد فاتورة جاهزة للطباعة في هذه الصفحة.",
  PRINT_FAILED: "تعذر طباعة الفاتورة.",
};

export const printerService = {
  list(): Promise<PrinterResult<PrinterListState>> {
    return window.desktopPrinter?.list() ?? Promise.resolve(unavailable());
  },
  getSelected(): Promise<PrinterResult<PrinterListState>> {
    return window.desktopPrinter?.getSelected() ?? Promise.resolve(unavailable());
  },
  select(deviceName: string): Promise<PrinterResult<PrinterListState>> {
    return window.desktopPrinter?.select(deviceName) ?? Promise.resolve(unavailable());
  },
  printReceipt(): Promise<PrintReceiptResult> {
    if (!document.querySelector("[data-receipt]"))
      return Promise.resolve({ success: false, code: "NO_RECEIPT" });
    return window.desktopPrinter?.printReceipt() ?? Promise.resolve(unavailable());
  },
  testPrint(): Promise<PrintReceiptResult> {
    return window.desktopPrinter?.testPrint() ?? Promise.resolve(unavailable());
  },
};
