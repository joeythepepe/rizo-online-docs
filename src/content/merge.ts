/**
 * Pure product merge helpers — safe for CLI (no Vite glob / import.meta).
 * Used by loadProduct (app) and scripts/export-pdf.ts (FS load).
 */

import { BILINGUAL_CHROME } from "./defaults/bilingual";
import type { BrandConfig, ServiceOnePagerContent, ZhString } from "./types";

function nonEmpty(value?: string | null): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Chinese string merge: product wins when non-empty after trim; else fallback.
 */
export function mergeZhString(
  primary?: string | null,
  fallback?: string | null,
): ZhString | undefined {
  return nonEmpty(primary) ?? nonEmpty(fallback);
}

/** @deprecated Use mergeZhString — kept as alias for call-site transitions. */
export const mergeBiString = mergeZhString;

/**
 * Merge order: chrome defaults ← brand defaults ← product JSON
 */
export function mergeProductContent(
  raw: Record<string, unknown>,
  brandBase: BrandConfig,
): unknown {
  const rawBrand =
    raw.brand && typeof raw.brand === "object"
      ? (raw.brand as Record<string, unknown>)
      : {};

  const companyName = mergeZhString(
    rawBrand.companyName as string | undefined,
    brandBase.companyName,
  );

  const brand: BrandConfig = {
    ...brandBase,
    ...rawBrand,
    companyName: companyName ?? brandBase.companyName,
    legalLine: mergeZhString(
      rawBrand.legalLine as string | undefined,
      brandBase.legalLine,
    ),
    ctaLabel: mergeZhString(
      rawBrand.ctaLabel as string | undefined,
      brandBase.ctaLabel,
    ),
    ctaDetail: mergeZhString(
      rawBrand.ctaDetail as string | undefined,
      brandBase.ctaDetail,
    ),
  };

  return {
    ...raw,
    brand,
  };
}

/**
 * Fill chrome-overridable titles and always-on disclaimer from Chinese defaults.
 * Call after Zod parse so required body fields are already valid.
 */
export function applyChromeDefaults(
  content: ServiceOnePagerContent,
): ServiceOnePagerContent {
  const brand: BrandConfig = {
    ...content.brand,
    ctaLabel:
      mergeZhString(content.brand.ctaLabel, BILINGUAL_CHROME.ctaLabel) ??
      BILINGUAL_CHROME.ctaLabel,
    ctaDetail:
      mergeZhString(content.brand.ctaDetail, BILINGUAL_CHROME.ctaDetail) ??
      BILINGUAL_CHROME.ctaDetail,
  };

  const next: ServiceOnePagerContent = {
    ...content,
    meta: {
      ...content.meta,
      disclaimer:
        mergeZhString(content.meta.disclaimer, BILINGUAL_CHROME.disclaimer) ??
        BILINGUAL_CHROME.disclaimer,
    },
    targetCustomer: {
      ...content.targetCustomer,
      title:
        mergeZhString(
          content.targetCustomer.title,
          BILINGUAL_CHROME.targetSection,
        ) ?? BILINGUAL_CHROME.targetSection,
    },
    deliverables: {
      ...content.deliverables,
      title:
        mergeZhString(
          content.deliverables.title,
          BILINGUAL_CHROME.deliverablesSection,
        ) ?? BILINGUAL_CHROME.deliverablesSection,
    },
    requirements: {
      ...content.requirements,
      title:
        mergeZhString(
          content.requirements.title,
          BILINGUAL_CHROME.requirementsSection,
        ) ?? BILINGUAL_CHROME.requirementsSection,
    },
    brand,
    layout: {
      dropOptionalIfTight: true,
      ...content.layout,
    },
  };

  if (next.highlights) {
    next.highlights = {
      ...next.highlights,
      title:
        mergeZhString(next.highlights.title, BILINGUAL_CHROME.highlights) ??
        BILINGUAL_CHROME.highlights,
    };
  }

  if (next.timeline) {
    next.timeline = {
      ...next.timeline,
      title:
        mergeZhString(next.timeline.title, BILINGUAL_CHROME.timeline) ??
        BILINGUAL_CHROME.timeline,
    };
  }

  return next;
}
