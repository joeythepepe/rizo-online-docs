/**
 * Pure product merge helpers — safe for CLI (no Vite glob / import.meta).
 * Used by loadProduct (app) and scripts/export-pdf.ts (FS load).
 */

import { BILINGUAL_CHROME } from "./defaults/bilingual";
import type { BiString, BrandConfig, ServiceOnePagerContent } from "./types";

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
 * Callers must pass brandBase (from brand/default.json or getBrandDefaults()).
 */
export function mergeProductContent(
  raw: Record<string, unknown>,
  brandBase: BrandConfig,
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
