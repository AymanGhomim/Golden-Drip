const safeNumber = (value: number | null | undefined) =>
  Number.isFinite(value) ? Number(value) : 0;

export function formatNumber(value: number | null | undefined, locale = "ar-EG") {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(safeNumber(value));
}

export function formatCurrency(
  value: number | null | undefined,
  currency = "EGP",
  locale = "ar-EG",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeNumber(value));
}

function validDate(value: string | number | Date | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | number | Date | null | undefined, locale = "ar-EG") {
  const date = validDate(value);
  return date ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date) : "—";
}

export function formatDateTime(value: string | number | Date | null | undefined, locale = "ar-EG") {
  const date = validDate(value);
  return date
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date)
    : "—";
}

export function formatRelativeTime(value: string | number | Date | null | undefined, locale = "ar") {
  const date = validDate(value);
  if (!date) return "—";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000], ["month", 2_592_000], ["week", 604_800],
    ["day", 86_400], ["hour", 3_600], ["minute", 60], ["second", 1],
  ];
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const [unit, divisor] = ranges.find(([, amount]) => Math.abs(seconds) >= amount) ?? ranges.at(-1)!;
  return formatter.format(Math.round(seconds / divisor), unit);
}
