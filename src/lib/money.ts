export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
export function formatMoney(
  value: number,
  currencySymbol = "ج.م",
  locale = "ar-EG",
) {
  return `${roundMoney(value).toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currencySymbol}`;
}
export function percentageOf(value: number, percentage: number) {
  return roundMoney((value * Math.max(0, percentage)) / 100);
}
