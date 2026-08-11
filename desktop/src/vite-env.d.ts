/// <reference types="vite/client" />

import type { DesktopPrinterApi } from "../electron/printer-contract";

declare global {
  interface Window {
    desktop?: { platform: string; versions: { electron: string } };
    desktopPrinter?: DesktopPrinterApi;
  }
}

export {};
