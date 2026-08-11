import { contextBridge, ipcRenderer } from "electron";
import type { DesktopPrinterApi } from "./printer-contract";

const desktopPrinter: DesktopPrinterApi = {
  list: () => ipcRenderer.invoke("desktop-printer:list"),
  getSelected: () => ipcRenderer.invoke("desktop-printer:get-selected"),
  select: (deviceName) => ipcRenderer.invoke("desktop-printer:select", deviceName),
  printReceipt: () => ipcRenderer.invoke("desktop-printer:print-receipt"),
  testPrint: () => ipcRenderer.invoke("desktop-printer:test-print"),
};

contextBridge.exposeInMainWorld("desktop", {
  platform: process.platform,
  versions: { electron: process.versions.electron },
});

contextBridge.exposeInMainWorld("desktopPrinter", desktopPrinter);
