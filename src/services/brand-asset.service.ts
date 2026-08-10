export type BrandAssetKind = "logo" | "favicon" | "loginBackground";

type BrandAssetRule = {
  accept: readonly string[];
  maxBytes: number;
  maxSizeLabel: string;
};

const COMMON_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export const BRAND_ASSET_RULES: Record<BrandAssetKind, BrandAssetRule> = {
  logo: {
    accept: COMMON_IMAGE_TYPES,
    maxBytes: 2 * 1024 * 1024,
    maxSizeLabel: "2 ميجابايت",
  },
  favicon: {
    accept: [
      ...COMMON_IMAGE_TYPES,
      "image/x-icon",
      "image/vnd.microsoft.icon",
    ],
    maxBytes: 1024 * 1024,
    maxSizeLabel: "1 ميجابايت",
  },
  loginBackground: {
    accept: COMMON_IMAGE_TYPES,
    maxBytes: 5 * 1024 * 1024,
    maxSizeLabel: "5 ميجابايت",
  },
};

export type BrandAssetValidation =
  | { valid: true }
  | { valid: false; error: string };

function validateImage(
  file: File,
  kind: BrandAssetKind,
): BrandAssetValidation {
  const rule = BRAND_ASSET_RULES[kind];

  if (!rule.accept.includes(file.type)) {
    return { valid: false, error: "صيغة الصورة غير مدعومة" };
  }

  if (file.size > rule.maxBytes) {
    return {
      valid: false,
      error: `حجم الصورة أكبر من الحد المسموح (${rule.maxSizeLabel})`,
    };
  }

  return { valid: true };
}

function serializeForDevelopment(file: File, kind: BrandAssetKind) {
  const validation = validateImage(file, kind);
  if (!validation.valid) return Promise.reject(new Error(validation.error));

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("تعذر تجهيز الصورة، حاول مرة أخرى"));
    reader.onerror = () =>
      reject(new Error("تعذر قراءة الصورة من جهازك، حاول مرة أخرى"));
    reader.readAsDataURL(file);
  });
}

export const brandAssetService = {
  validateImage,
  serializeForDevelopment,
  createPreview: serializeForDevelopment,
  removeAsset: () => undefined,
  getAccept: (kind: BrandAssetKind) =>
    BRAND_ASSET_RULES[kind].accept.join(","),
  getRule: (kind: BrandAssetKind) => BRAND_ASSET_RULES[kind],
};
