import brandDefaultJson from "../../content/brand/default.json";
import {
  applyChromeDefaults,
  mergeProductContent,
} from "./merge";
import { brandConfigSchema, parseProduct } from "./schema";
import type { BrandConfig, ServiceOnePagerContent } from "./types";

// Re-export pure helpers so existing import paths keep working.
export {
  applyChromeDefaults,
  mergeBiString,
  mergeZhString,
  mergeProductContent,
} from "./merge";

/**
 * Bundled product JSON via Vite glob.
 * Path is relative to this file → repo `content/products/*.json`.
 */
const modules = import.meta.glob("../../content/products/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

const brandDefaults = brandConfigSchema.parse(
  brandDefaultJson,
) as BrandConfig;

/** Extract product id from a glob key or file path; skips `_`-prefixed templates. */
export function productIdFromPath(path: string): string | null {
  const match = path.match(/[/\\]([^/\\]+)\.json$/);
  if (!match) return null;
  const id = match[1];
  if (id.startsWith("_")) return null;
  return id;
}

/** Pure helper: derive sorted product ids from module keys / file paths. */
export function listProductIdsFromKeys(keys: string[]): string[] {
  const ids = new Set<string>();
  for (const key of keys) {
    const id = productIdFromPath(key);
    if (id) ids.add(id);
  }
  return Array.from(ids).sort();
}

/** Product ids available via glob (excludes `_template` and other `_` prefixes). */
export function listProductIds(): string[] {
  return listProductIdsFromKeys(Object.keys(modules));
}

/**
 * Load, merge brand defaults, validate with Zod, apply chrome defaults.
 * Throws if id unknown (including `_`-prefixed templates) or validation fails.
 * Shares source of truth with `listProductIds` via `productIdFromPath`.
 */
export function loadProduct(id: string): ServiceOnePagerContent {
  const key = Object.keys(modules).find((k) => productIdFromPath(k) === id);
  if (!key) {
    throw new Error(
      `Unknown product: ${id}. Known: ${listProductIds().join(", ") || "(none)"}`,
    );
  }
  const raw = modules[key];
  if (!raw || typeof raw !== "object") {
    throw new Error(`Invalid product module for ${id}`);
  }
  const merged = mergeProductContent(
    raw as Record<string, unknown>,
    brandDefaults,
  );
  const parsed = parseProduct(merged);
  return applyChromeDefaults(parsed);
}

/** Expose brand defaults for tests / CLI. */
export function getBrandDefaults(): BrandConfig {
  return brandDefaults;
}

/** Expose raw module map size for smoke checks. */
export function getProductModuleCount(): number {
  return Object.keys(modules).length;
}
