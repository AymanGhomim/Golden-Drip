const units: Record<
  string,
  { family: "weight" | "volume" | "count"; baseFactor: number }
> = {
  g: { family: "weight", baseFactor: 1 },
  gm: { family: "weight", baseFactor: 1 },
  gram: { family: "weight", baseFactor: 1 },
  جم: { family: "weight", baseFactor: 1 },
  kg: { family: "weight", baseFactor: 1000 },
  kilogram: { family: "weight", baseFactor: 1000 },
  كجم: { family: "weight", baseFactor: 1000 },
  ml: { family: "volume", baseFactor: 1 },
  مل: { family: "volume", baseFactor: 1 },
  l: { family: "volume", baseFactor: 1000 },
  liter: { family: "volume", baseFactor: 1000 },
  litre: { family: "volume", baseFactor: 1000 },
  لتر: { family: "volume", baseFactor: 1000 },
  piece: { family: "count", baseFactor: 1 },
  pcs: { family: "count", baseFactor: 1 },
  قطعة: { family: "count", baseFactor: 1 },
};

const normalize = (unit: string) =>
  unit.trim().toLowerCase().replaceAll(".", "");

export function convertInventoryQuantity(
  quantity: number,
  fromUnit: string,
  toUnit: string,
) {
  const from = units[normalize(fromUnit)];
  const to = units[normalize(toUnit)];
  if (!from || !to || from.family !== to.family) {
    if (normalize(fromUnit) === normalize(toUnit)) return quantity;
    throw new Error(`لا يمكن تحويل وحدة ${fromUnit} إلى ${toUnit}.`);
  }
  return (quantity * from.baseFactor) / to.baseFactor;
}
