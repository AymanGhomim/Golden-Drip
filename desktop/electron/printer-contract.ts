export type DesktopPrinter = {
  deviceName: string;
  displayName: string;
  description?: string;
  status?: number;
  isDefault: boolean;
};

export type PrinterSettings = {
  receiptPrinterDeviceName?: string;
};

export type PrinterErrorCode =
  | "DESKTOP_API_UNAVAILABLE"
  | "PRINTER_DISCOVERY_FAILED"
  | "WINDOWS_PRINT_SERVICE_UNAVAILABLE"
  | "INVALID_PRINTER"
  | "NO_PRINTER_SELECTED"
  | "SELECTED_PRINTER_UNAVAILABLE"
  | "PRINT_IN_PROGRESS"
  | "NO_RECEIPT"
  | "PRINT_FAILED";

export type PrinterResult<T> =
  | { success: true; data: T }
  | { success: false; code: PrinterErrorCode; detail?: string };

export type PrinterListState = {
  printers: DesktopPrinter[];
  selectedDeviceName?: string;
  selectedPrinterAvailable: boolean;
};

export type PrintReceiptResult = PrinterResult<{ deviceName: string }>;

export type DesktopPrinterApi = {
  list(): Promise<PrinterResult<PrinterListState>>;
  getSelected(): Promise<PrinterResult<PrinterListState>>;
  select(deviceName: string): Promise<PrinterResult<PrinterListState>>;
  printReceipt(): Promise<PrintReceiptResult>;
  testPrint(): Promise<PrintReceiptResult>;
};
