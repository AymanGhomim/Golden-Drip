import {
  BrowserWindow,
  ipcMain,
  type IpcMainInvokeEvent,
  type PrinterInfo,
  type WebContents,
  type WebContentsPrintOptions,
} from "electron";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type {
  DesktopPrinter,
  PrintReceiptResult,
  PrinterListState,
  PrinterResult,
} from "./printer-contract";
import {
  isValidDeviceName,
  readPrinterSettings,
  writePrinterSettings,
} from "./printer-settings";

export const PRINTER_CHANNELS = {
  list: "desktop-printer:list",
  getSelected: "desktop-printer:get-selected",
  select: "desktop-printer:select",
  printReceipt: "desktop-printer:print-receipt",
  testPrint: "desktop-printer:test-print",
} as const;

let printInProgress = false;
const PRINTER_DISCOVERY_TIMEOUT_MS = 12_000;
const execFileAsync = promisify(execFile);

class WindowsPrintServiceUnavailableError extends Error {}

async function ensureWindowsPrintService() {
  if (process.platform !== "win32") return;
  try {
    const { stdout } = await execFileAsync("sc.exe", ["query", "Spooler"], {
      encoding: "utf8",
      timeout: 3_000,
      windowsHide: true,
    });
    if (!/STATE\s*:\s*4\b/.test(stdout))
      throw new WindowsPrintServiceUnavailableError();
  } catch (error) {
    if (error instanceof WindowsPrintServiceUnavailableError) throw error;
    throw new WindowsPrintServiceUnavailableError();
  }
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Windows printer discovery timed out")),
      milliseconds,
    );
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

function normalizePrinter(printer: PrinterInfo): DesktopPrinter {
  const options = printer.options as Record<string, unknown>;
  const defaultValue = options["printer-is-default"] ?? options.isDefault;
  const statusValue = options["printer-status"] ?? options.status;
  const numericStatus = Number(statusValue);
  return {
    deviceName: printer.name,
    displayName: printer.displayName || printer.name,
    description: printer.description || undefined,
    status: Number.isFinite(numericStatus) ? numericStatus : undefined,
    isDefault:
      defaultValue === true || defaultValue === 1 || defaultValue === "true",
  };
}

async function getInstalledPrinters(webContents: WebContents) {
  await ensureWindowsPrintService();
  const printers = await withTimeout(
    webContents.getPrintersAsync(),
    PRINTER_DISCOVERY_TIMEOUT_MS,
  );
  return printers
    .filter((printer) => isValidDeviceName(printer.name))
    .map(normalizePrinter)
    .sort((left, right) => {
      if (left.isDefault !== right.isDefault) return left.isDefault ? -1 : 1;
      return left.displayName.localeCompare(right.displayName, "ar");
    });
}

async function getPrinterListState(
  webContents: WebContents,
): Promise<PrinterListState> {
  const [printers, settings] = await Promise.all([
    getInstalledPrinters(webContents),
    readPrinterSettings(),
  ]);
  const selectedDeviceName = settings.receiptPrinterDeviceName;
  return {
    printers,
    selectedDeviceName,
    selectedPrinterAvailable: Boolean(
      selectedDeviceName &&
        printers.some((printer) => printer.deviceName === selectedDeviceName),
    ),
  };
}

function failure<T>(
  code: Exclude<PrinterResult<T>, { success: true }>["code"],
  detail?: string,
): PrinterResult<T> {
  return { success: false, code, detail };
}

async function discover(
  webContents: WebContents,
): Promise<PrinterResult<PrinterListState>> {
  try {
    return { success: true, data: await getPrinterListState(webContents) };
  } catch (error) {
    console.error("Unable to discover Windows printers", error);
    return failure(
      error instanceof WindowsPrintServiceUnavailableError
        ? "WINDOWS_PRINT_SERVICE_UNAVAILABLE"
        : "PRINTER_DISCOVERY_FAILED",
    );
  }
}

async function selectedInstalledPrinter(webContents: WebContents) {
  const state = await getPrinterListState(webContents);
  if (!state.selectedDeviceName)
    return failure<DesktopPrinter>("NO_PRINTER_SELECTED");
  const printer = state.printers.find(
    (item) => item.deviceName === state.selectedDeviceName,
  );
  return printer
    ? ({ success: true, data: printer } as const)
    : failure<DesktopPrinter>("SELECTED_PRINTER_UNAVAILABLE");
}

function sendToPrinter(
  webContents: WebContents,
  deviceName: string,
): Promise<PrintReceiptResult> {
  const options: WebContentsPrintOptions = {
    silent: true,
    deviceName,
    printBackground: true,
    color: false,
    margins: { marginType: "none" },
    usePrinterDefaultPageSize: true,
  };
  return new Promise((resolve) => {
    webContents.print(options, (success, failureReason) => {
      if (success) resolve({ success: true, data: { deviceName } });
      else
        resolve(
          failure(
            "PRINT_FAILED",
            failureReason ? failureReason.slice(0, 240) : undefined,
          ),
        );
    });
  });
}

function testReceiptHtml() {
  const now = new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());
  return `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<style>
@page { size: auto; margin: 0; }
html,body{width:80mm;margin:0;background:#fff;color:#111;font-family:Tahoma,Arial,sans-serif}
main{width:80mm;padding:6mm 4mm;text-align:center;font-size:12px;line-height:1.8}
h1{margin:0 0 2mm;font-size:17px}.line{margin:3mm 0;border-top:1px dashed #111}
bdi{unicode-bidi:isolate;font-variant-numeric:tabular-nums}
</style></head><body><main><h1>Penta-K Cafe</h1><strong>اختبار الطابعة</strong>
<div class="line"></div><p>تم إعداد طابعة الفواتير بنجاح</p><bdi dir="ltr">${now}</bdi>
<div class="line"></div></main></body></html>`;
}

async function printTestReceipt(
  parent: BrowserWindow,
  deviceName: string,
): Promise<PrintReceiptResult> {
  const testWindow = new BrowserWindow({
    show: false,
    parent,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });
  try {
    await testWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(testReceiptHtml())}`,
    );
    return await sendToPrinter(testWindow.webContents, deviceName);
  } finally {
    if (!testWindow.isDestroyed()) testWindow.destroy();
  }
}

function trustedWindow(
  event: IpcMainInvokeEvent,
  mainWindow: BrowserWindow,
): BrowserWindow | null {
  const senderWindow = BrowserWindow.fromWebContents(event.sender);
  return senderWindow === mainWindow ? senderWindow : null;
}

export function registerPrinterIpc(mainWindow: BrowserWindow) {
  Object.values(PRINTER_CHANNELS).forEach((channel) =>
    ipcMain.removeHandler(channel),
  );
  ipcMain.handle(PRINTER_CHANNELS.list, async (event) =>
    trustedWindow(event, mainWindow)
      ? discover(event.sender)
      : failure("PRINTER_DISCOVERY_FAILED"),
  );
  ipcMain.handle(PRINTER_CHANNELS.getSelected, async (event) =>
    trustedWindow(event, mainWindow)
      ? discover(event.sender)
      : failure("PRINTER_DISCOVERY_FAILED"),
  );
  ipcMain.handle(
    PRINTER_CHANNELS.select,
    async (event, requestedDeviceName: unknown) => {
      if (!trustedWindow(event, mainWindow) || !isValidDeviceName(requestedDeviceName))
        return failure("INVALID_PRINTER");
      try {
        const printers = await getInstalledPrinters(event.sender);
        if (!printers.some((printer) => printer.deviceName === requestedDeviceName))
          return failure("INVALID_PRINTER");
        await writePrinterSettings({
          receiptPrinterDeviceName: requestedDeviceName,
        });
        return discover(event.sender);
      } catch (error) {
        console.error("Unable to save the selected receipt printer", error);
        return failure("INVALID_PRINTER");
      }
    },
  );

  ipcMain.handle(PRINTER_CHANNELS.printReceipt, async (event) => {
    if (!trustedWindow(event, mainWindow)) return failure("PRINT_FAILED");
    if (printInProgress) return failure("PRINT_IN_PROGRESS");
    printInProgress = true;
    try {
      const selected = await selectedInstalledPrinter(event.sender);
      if (!selected.success) return selected;
      return await sendToPrinter(event.sender, selected.data.deviceName);
    } catch (error) {
      console.error("Unable to print the order receipt", error);
      return failure(
        error instanceof WindowsPrintServiceUnavailableError
          ? "WINDOWS_PRINT_SERVICE_UNAVAILABLE"
          : "PRINT_FAILED",
      );
    } finally {
      printInProgress = false;
    }
  });

  ipcMain.handle(PRINTER_CHANNELS.testPrint, async (event) => {
    const senderWindow = trustedWindow(event, mainWindow);
    if (!senderWindow) return failure("PRINT_FAILED");
    if (printInProgress) return failure("PRINT_IN_PROGRESS");
    printInProgress = true;
    try {
      const selected = await selectedInstalledPrinter(event.sender);
      if (!selected.success) return selected;
      return await printTestReceipt(senderWindow, selected.data.deviceName);
    } catch (error) {
      console.error("Unable to print the printer test receipt", error);
      return failure(
        error instanceof WindowsPrintServiceUnavailableError
          ? "WINDOWS_PRINT_SERVICE_UNAVAILABLE"
          : "PRINT_FAILED",
      );
    } finally {
      printInProgress = false;
    }
  });
}

export async function logDetectedPrinters(webContents: WebContents) {
  const printers = await getInstalledPrinters(webContents);
  console.log(`Electron detected ${printers.length} Windows printer(s)`);
  printers.forEach((printer) =>
    console.log(
      `- ${printer.deviceName}${printer.isDefault ? " (Windows default)" : ""}`,
    ),
  );
}
