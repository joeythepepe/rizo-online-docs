/**
 * Happy-path screenshot smoke for the example product print route.
 * Prerequisite: `bun run build` (webServer runs next start against .next/).
 *
 * Screenshots under `output/smoke/` are human-review artifacts (not visual-diff
 * baselines). Paths are asserted to exist after write.
 *
 * Run: bun run test:smoke
 */
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import {
  A4_HEIGHT_MM,
  FONTS_READY_TIMEOUT_MS,
  MEASURE_OVERFLOW_SOURCE,
  OVERFLOW_TOLERANCE_MM,
  type OverflowMeasure,
} from "../src/export/pdf";

const SMOKE_OUT = join(process.cwd(), "output", "smoke");

async function waitForPrintReady(page: import("@playwright/test").Page) {
  await page.waitForLoadState("load");
  await page.waitForFunction(() => document.fonts.ready, undefined, {
    timeout: FONTS_READY_TIMEOUT_MS,
  });
}

async function measureOverflow(
  page: import("@playwright/test").Page,
): Promise<OverflowMeasure> {
  return page.evaluate(
    ({ source, opts }) => {
      // eslint-disable-next-line no-eval -- same isolation pattern as export CLI
      const fn = eval(`(${source})`) as (o: {
        toleranceMm: number;
        a4HeightMm: number;
      }) => OverflowMeasure;
      return fn(opts);
    },
    {
      source: MEASURE_OVERFLOW_SOURCE,
      opts: {
        toleranceMm: OVERFLOW_TOLERANCE_MM,
        a4HeightMm: A4_HEIGHT_MM,
      },
    },
  );
}

test.describe("print screenshot smoke", () => {
  test("gaokao-uk A4 renders Chinese content without overflow", async ({
    page,
  }) => {
    await page.goto("/print/gaokao-uk");
    await waitForPrintReady(page);

    const a4 = page.locator("[data-page=a4]");
    await expect(a4).toBeVisible();

    // Chinese product name (CN-only documents)
    await expect(a4.getByText("高考通英国").first()).toBeVisible();
    await expect(a4.getByText("UK Undergraduate Sprint")).toHaveCount(0);

    // Density attribute present (normal for example product)
    await expect(page.locator("[data-density=normal]").first()).toBeVisible();

    mkdirSync(SMOKE_OUT, { recursive: true });
    const shotPath = join(SMOKE_OUT, "gaokao-uk.png");
    await a4.screenshot({ path: shotPath });
    expect(existsSync(shotPath), `smoke PNG missing: ${shotPath}`).toBe(true);

    const measure = await measureOverflow(page);
    expect(
      measure.overflows,
      `gaokao-uk should fit A4 (deltaMm=${measure.deltaMm.toFixed(3)}, worst=${measure.worstSelector})`,
    ).toBe(false);
  });

  test("gaokao-uk?density=compact applies compact tokens", async ({
    page,
  }) => {
    await page.goto("/print/gaokao-uk?density=compact");
    await waitForPrintReady(page);

    const a4 = page.locator("[data-page=a4]");
    await expect(a4).toBeVisible();
    await expect(page.locator("[data-density=compact]").first()).toBeVisible();

    // Compact CSS signal: body-sm tokens applied (not data-density alone)
    const bodySmCount = await a4.locator(".text-print-body-sm").count();
    expect(
      bodySmCount,
      "compact density should apply text-print-body-sm to list/body copy",
    ).toBeGreaterThan(0);

    // Requirements section still present (no SoftPanel gray box)
    await expect(a4.getByText("客户需具备").first()).toBeVisible();

    mkdirSync(SMOKE_OUT, { recursive: true });
    const shotPath = join(SMOKE_OUT, "gaokao-uk-compact.png");
    await a4.screenshot({ path: shotPath });
    expect(existsSync(shotPath), `smoke PNG missing: ${shotPath}`).toBe(true);

    // Compact only shrinks; example product must still fit
    const measure = await measureOverflow(page);
    expect(
      measure.overflows,
      `gaokao-uk compact should fit A4 (deltaMm=${measure.deltaMm.toFixed(3)}, worst=${measure.worstSelector})`,
    ).toBe(false);
  });
});
