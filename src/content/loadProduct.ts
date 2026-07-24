/**
 * Server / Node product loader (filesystem).
 * Do not import this module from client components — pass data as props instead.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
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

function projectRoot(): string {
  return process.cwd();
}

function productsDir(root = projectRoot()): string {
  return join(root, "content", "products");
}

function brandDefaultsPath(root = projectRoot()): string {
  return join(root, "content", "brand", "default.json");
}

let cachedBrand: BrandConfig | null = null;

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

/** Product ids on disk (excludes `_template` and other `_` prefixes). */
export function listProductIds(root = projectRoot()): string[] {
  const dir = productsDir(root);
  if (!existsSync(dir)) return [];
  return listProductIdsFromKeys(
    readdirSync(dir).map((name) => join(dir, name)),
  );
}

export function getBrandDefaults(root = projectRoot()): BrandConfig {
  if (cachedBrand && root === projectRoot()) return cachedBrand;
  const raw = JSON.parse(readFileSync(brandDefaultsPath(root), "utf8"));
  const brand = brandConfigSchema.parse(raw) as BrandConfig;
  if (root === projectRoot()) cachedBrand = brand;
  return brand;
}

/**
 * Load, merge brand defaults, validate with Zod, apply chrome defaults.
 * Throws if id unknown (including `_`-prefixed templates) or validation fails.
 */
export function loadProduct(
  id: string,
  root = projectRoot(),
): ServiceOnePagerContent {
  if (id.startsWith("_")) {
    throw new Error(
      `Unknown product: ${id} (_-prefixed templates are not loadable)`,
    );
  }
  const file = join(productsDir(root), `${id}.json`);
  if (!existsSync(file)) {
    throw new Error(
      `Unknown product: ${id}. Known: ${listProductIds(root).join(", ") || "(none)"}`,
    );
  }
  const raw = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
  const merged = mergeProductContent(raw, getBrandDefaults(root));
  const parsed = parseProduct(merged);
  return applyChromeDefaults(parsed);
}

/** Number of product JSON files including `_` templates (smoke checks). */
export function getProductModuleCount(root = projectRoot()): number {
  const dir = productsDir(root);
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((n) => n.endsWith(".json")).length;
}
