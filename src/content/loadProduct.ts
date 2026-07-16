import brandDefaultJson from "../../content/brand/default.json";
import { BILINGUAL_CHROME } from "./defaults/bilingual";
import { brandConfigSchema, parseProduct } from "./schema";
import type { BiString, BrandConfig, ServiceOnePagerContent } from "./types";

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

function nonEmptyLang(value?: string | null): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Per-language BiString merge: product side wins when non-empty after trim;
 * otherwise fall back. Returns undefined only when both sides contribute nothing.
 * Zod enforces both langs non-empty for required fields after merge.
 */
export function mergeBiString(
  primary?: { zh?: string; en?: string } | null,
  fallback?: { zh?: string; en?: string } | null,
): BiString | undefined {
  if (primary == null && fallback == null) return undefined;

  const zh = nonEmptyLang(primary?.zh) ?? nonEmptyLang(fallback?.zh) ?? "";
  const en = nonEmptyLang(primary?.en) ?? nonEmptyLang(fallback?.en) ?? "";

  if (!zh && !en) return undefined;
  return { zh, en };
}

/**
 * Merge order (DESIGN.md):
 * chrome BiStrings ← brand defaults ← product JSON
 *
 * Pure: safe for CLI (fs read + this function + parseProduct).
 */
export function mergeProductContent(
  raw: Record<string, unknown>,
  brandBase: BrandConfig = brandDefaults,
): unknown {
  const rawBrand =
    raw.brand && typeof raw.brand === "object"
      ? (raw.brand as Record<string, unknown>)
      : {};

  const companyName = mergeBiString(
    rawBrand.companyName as { zh?: string; en?: string } | undefined,
    brandBase.companyName,
  );

  const brand: BrandConfig = {
    ...brandBase,
    ...rawBrand,
    // Always deep-merge required companyName (never leave a partial product pair)
    companyName: companyName ?? brandBase.companyName,
    legalLine: mergeBiString(
      rawBrand.legalLine as { zh?: string; en?: string } | undefined,
      brandBase.legalLine,
    ),
    ctaLabel: mergeBiString(
      rawBrand.ctaLabel as { zh?: string; en?: string } | undefined,
      brandBase.ctaLabel,
    ),
    ctaDetail: mergeBiString(
      rawBrand.ctaDetail as { zh?: string; en?: string } | undefined,
      brandBase.ctaDetail,
    ),
  };

  return {
    ...raw,
    brand,
  };
}

/**
 * Fill chrome-overridable titles and always-on disclaimer from bilingual defaults.
 * Call after Zod parse so required body fields are already valid.
 */
export function applyChromeDefaults(
  content: ServiceOnePagerContent,
): ServiceOnePagerContent {
  const brand: BrandConfig = {
    ...content.brand,
    ctaLabel:
      mergeBiString(content.brand.ctaLabel, BILINGUAL_CHROME.ctaLabel) ??
      BILINGUAL_CHROME.ctaLabel,
    ctaDetail:
      mergeBiString(content.brand.ctaDetail, BILINGUAL_CHROME.ctaDetail) ??
      BILINGUAL_CHROME.ctaDetail,
  };

  const next: ServiceOnePagerContent = {
    ...content,
    meta: {
      ...content.meta,
      disclaimer:
        mergeBiString(content.meta.disclaimer, BILINGUAL_CHROME.disclaimer) ??
        BILINGUAL_CHROME.disclaimer,
    },
    targetCustomer: {
      ...content.targetCustomer,
      title:
        mergeBiString(
          content.targetCustomer.title,
          BILINGUAL_CHROME.targetSection,
        ) ?? BILINGUAL_CHROME.targetSection,
    },
    deliverables: {
      ...content.deliverables,
      title:
        mergeBiString(
          content.deliverables.title,
          BILINGUAL_CHROME.deliverablesSection,
        ) ?? BILINGUAL_CHROME.deliverablesSection,
    },
    requirements: {
      ...content.requirements,
      title:
        mergeBiString(
          content.requirements.title,
          BILINGUAL_CHROME.requirementsSection,
        ) ?? BILINGUAL_CHROME.requirementsSection,
    },
    brand,
    layout: {
      dropOptionalIfTight: true,
      bilingual: true,
      ...content.layout,
    },
  };

  if (next.highlights) {
    next.highlights = {
      ...next.highlights,
      title:
        mergeBiString(next.highlights.title, BILINGUAL_CHROME.highlights) ??
        BILINGUAL_CHROME.highlights,
    };
  }

  if (next.timeline) {
    next.timeline = {
      ...next.timeline,
      title:
        mergeBiString(next.timeline.title, BILINGUAL_CHROME.timeline) ??
        BILINGUAL_CHROME.timeline,
    };
  }

  return next;
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
  const merged = mergeProductContent(raw as Record<string, unknown>);
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
