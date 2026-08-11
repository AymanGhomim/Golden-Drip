import { app } from "electron";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PrinterSettings } from "./printer-contract";

const SETTINGS_FILE_NAME = "desktop-printer-settings.json";
const MAX_DEVICE_NAME_LENGTH = 512;

export function isValidDeviceName(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_DEVICE_NAME_LENGTH &&
    !Array.from(value).some((character) => {
      const code = character.charCodeAt(0);
      return code <= 31 || code === 127;
    })
  );
}

function settingsPath() {
  return path.join(app.getPath("userData"), SETTINGS_FILE_NAME);
}

export async function readPrinterSettings(): Promise<PrinterSettings> {
  try {
    const raw = await readFile(settingsPath(), "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const deviceName = (parsed as Record<string, unknown>).receiptPrinterDeviceName;
    return isValidDeviceName(deviceName)
      ? { receiptPrinterDeviceName: deviceName }
      : {};
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT" && !(error instanceof SyntaxError))
      console.error("Unable to read desktop printer settings", error);
    return {};
  }
}

export async function writePrinterSettings(settings: PrinterSettings) {
  const safeSettings: PrinterSettings = isValidDeviceName(
    settings.receiptPrinterDeviceName,
  )
    ? { receiptPrinterDeviceName: settings.receiptPrinterDeviceName }
    : {};
  await writeFile(settingsPath(), `${JSON.stringify(safeSettings, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
}
