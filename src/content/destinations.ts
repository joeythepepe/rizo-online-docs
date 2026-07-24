import { TITLE_BY_CODE, isCountryCode } from "../components/CountryFlag";

/** Known non-ISO region keys (中考 etc.). */
const REGION_LABELS: Record<string, string> = {
  "sz-pugao": "深圳普高",
  "sz-zhiye": "深圳职高",
};

/**
 * Destination filter key for a product.
 * Prefer regionKey when set; else ISO countryCode.
 */
export function resolveDestKey(product: {
  regionKey?: string;
  countryCode?: string;
}): string | undefined {
  if (product.regionKey?.trim()) return product.regionKey.trim();
  if (product.countryCode?.trim()) return product.countryCode.trim().toUpperCase();
  return undefined;
}

/** Human label for a dest filter chip. */
export function destLabel(key: string): string {
  if (REGION_LABELS[key]) return REGION_LABELS[key];
  const upper = key.toUpperCase();
  if (isCountryCode(upper)) return TITLE_BY_CODE[upper];
  return key;
}

/** Stable sort: known region keys first by label, then ISO by Chinese label. */
export function compareDestKeys(a: string, b: string): number {
  return destLabel(a).localeCompare(destLabel(b), "zh-CN");
}
