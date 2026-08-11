import type { DesktopOrderStatus } from "@/types";

export const operationalOrderSequence: DesktopOrderStatus[] = [
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "COMPLETED",
];

export function formatMoney(value: number) {
  return `${value.toLocaleString("ar-EG")} ج.م`;
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ar-EG");
}
