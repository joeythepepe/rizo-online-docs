/**
 * Shared PDF export constants and helpers (CLI-first; not a published API).
 * Used by scripts/export-pdf.ts.
 */

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
/**
 * MediaBox acceptance tolerance (mm).
 * Playwright A4 is often 595×841/842 pt → ~209.89×297.0 mm; allow 0.15 mm.
 */
export const A4_MEDIABOX_TOLERANCE_MM = 0.15;
/** Overflow measure tolerance (mm). */
export const OVERFLOW_TOLERANCE_MM = 0.5;

export const EXPORT_PORT = 4173;
export const EXPORT_ORIGIN = `http://127.0.0.1:${EXPORT_PORT}`;

/** document.fonts.ready gate — fail export if exceeded. */
export const FONTS_READY_TIMEOUT_MS = 10_000;
export const PAGE_LOAD_TIMEOUT_MS = 30_000;
export const SERVER_READY_TIMEOUT_MS = 60_000;

export const PDF_PRODUCER = "poster_business-export";
export const PDF_CREATOR = "poster_business-export";

export interface OverflowMeasure {
  overflows: boolean;
  scrollHeight: number;
  clientHeight: number;
  deltaPx: number;
  deltaMm: number;
  worstSelector: string;
}

/**
 * Browser overflow measure as source string (avoids tsx `__name` in Chromium).
 *
 * DESIGN: measure `[data-page=a4]` scrollHeight vs clientHeight (±0.5 mm).
 * Also scans overflow-hidden descendants so flex/min-h-0 clipping inside the
 * fixed A4 frame is not a silent success.
 */
export const MEASURE_OVERFLOW_SOURCE = `({ toleranceMm = 0.5, a4HeightMm = 297 } = {}) => {
  const page = document.querySelector("[data-page=a4]");
  if (!page) {
    return {
      overflows: true,
      scrollHeight: 0,
      clientHeight: 0,
      deltaPx: Number.POSITIVE_INFINITY,
      deltaMm: Number.POSITIVE_INFINITY,
      worstSelector: "(missing [data-page=a4])",
    };
  }

  const clientHeight = page.clientHeight;
  const pxPerMm = clientHeight > 0 ? clientHeight / a4HeightMm : 96 / 25.4;
  const tolerancePx = toleranceMm * pxPerMm;

  let maxDelta = page.scrollHeight - page.clientHeight;
  let worst = "[data-page=a4]";

  const nodes = page.querySelectorAll("*");
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    const style = getComputedStyle(el);
    const clipsY =
      style.overflowY === "hidden" ||
      style.overflowY === "auto" ||
      style.overflowY === "scroll" ||
      style.overflow === "hidden" ||
      style.overflow === "auto" ||
      style.overflow === "scroll";
    if (!clipsY) continue;
    if (el.clientHeight <= 0) continue;
    // Ignore pure visual max-h zone bands that are still within the page frame
    // only when the page itself is not overflowing — still report the worst clip.
    const delta = el.scrollHeight - el.clientHeight;
    if (delta > maxDelta) {
      maxDelta = delta;
      const cls = el.className && typeof el.className === "string"
        ? "." + el.className.trim().split(/\\s+/).slice(0, 3).join(".")
        : "";
      worst = el.tagName.toLowerCase() + cls;
    }
  }

  const deltaMm = maxDelta / pxPerMm;
  return {
    overflows: maxDelta > tolerancePx,
    scrollHeight: page.scrollHeight,
    clientHeight,
    deltaPx: maxDelta,
    deltaMm,
    worstSelector: worst,
  };
}`;

/** Build print URL for export. */
export function printUrl(
  productId: string,
  opts: { export?: boolean; density?: "compact" | "normal" } = {},
): string {
  const params = new URLSearchParams();
  if (opts.export !== false) params.set("export", "1");
  if (opts.density === "compact") params.set("density", "compact");
  const qs = params.toString();
  return `${EXPORT_ORIGIN}/print/${encodeURIComponent(productId)}${qs ? `?${qs}` : ""}`;
}

/** PDF document title from bilingual meta. */
export function documentTitleFromMeta(documentTitle: {
  zh: string;
  en: string;
}): string {
  return `${documentTitle.zh} — ${documentTitle.en}`;
}

/** Convert PDF points (1/72") to mm. */
export function pointsToMm(pt: number): number {
  return (pt * 25.4) / 72;
}

export interface MediaBoxCheck {
  ok: boolean;
  widthMm: number;
  heightMm: number;
  widthPt: number;
  heightPt: number;
}

/** Assert A4 MediaBox within tolerance (mm). */
export function checkA4MediaBox(
  widthPt: number,
  heightPt: number,
  toleranceMm = A4_MEDIABOX_TOLERANCE_MM,
): MediaBoxCheck {
  const widthMm = pointsToMm(widthPt);
  const heightMm = pointsToMm(heightPt);
  const ok =
    Math.abs(widthMm - A4_WIDTH_MM) <= toleranceMm &&
    Math.abs(heightMm - A4_HEIGHT_MM) <= toleranceMm;
  return { ok, widthMm, heightMm, widthPt, heightPt };
}
