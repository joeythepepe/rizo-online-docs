/**
 * Playwright PDF export CLI with overflow gate.
 *
 * Usage:
 *   bun run export:pdf --product gaokao-uk-ug
 *   bun run export:pdf --product gaokao-uk-ug --force
 *   bun run export:pdf --product gaokao-uk-ug --out output/custom.pdf
 *   bun run export:pdf gaokao-uk-ug
 *
 * Flow: Zod-validate product via FS (same merge/chrome as app loadProduct) →
 * build → vite preview → Chromium → measure overflow → one compact retry →
 * PDF + MediaBox check (or fail screenshot).
 */

import { spawn, type ChildProcess, execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";
import { brandConfigSchema, parseProduct } from "../src/content/schema.ts";
import {
  applyChromeDefaults,
  mergeProductContent,
} from "../src/content/merge.ts";
import {
  A4_HEIGHT_MM,
  A4_MEDIABOX_TOLERANCE_MM,
  A4_WIDTH_MM,
  checkA4MediaBox,
  documentTitleFromMeta,
  EXPORT_ORIGIN,
  EXPORT_PORT,
  FONTS_READY_TIMEOUT_MS,
  MEASURE_OVERFLOW_SOURCE,
  OVERFLOW_TOLERANCE_MM,
  PAGE_LOAD_TIMEOUT_MS,
  PDF_CREATOR,
  printUrl,
  SERVER_READY_TIMEOUT_MS,
  type OverflowMeasure,
} from "../src/export/pdf.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const require = createRequire(import.meta.url);

export interface ExportOptions {
  productId: string;
  outPath?: string;
  /** Write PDF even if overflow (logs warning). */
  force?: boolean;
  /** Skip `bun run build` when dist/ already present. */
  skipBuild?: boolean;
  /** Reuse an already-running preview (do not spawn). */
  baseUrl?: string;
  /** Quiet child logs. */
  quiet?: boolean;
}

export interface ExportResult {
  productId: string;
  pdfPath: string | null;
  bytes: number;
  durationMs: number;
  usedCompact: boolean;
  overflow: OverflowMeasure;
  mediaBoxOk: boolean | null;
  forced: boolean;
}

function log(...args: unknown[]) {
  console.log(...args);
}

function fail(msg: string): never {
  console.error("ERROR:", msg);
  process.exit(1);
}

function parseArgs(argv: string[]): ExportOptions {
  const opts: ExportOptions = { productId: "" };
  const rest: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--product" || a === "-p") {
      opts.productId = argv[++i] ?? "";
    } else if (a === "--out" || a === "-o") {
      opts.outPath = argv[++i];
    } else if (a === "--force" || a === "-f") {
      opts.force = true;
    } else if (a === "--skip-build") {
      opts.skipBuild = true;
    } else if (a === "--base-url") {
      opts.baseUrl = argv[++i];
    } else if (a === "--help" || a === "-h") {
      console.log(`Usage: export-pdf --product <id> [--out <path>] [--force] [--skip-build]
  product id may also be the first positional argument.`);
      process.exit(0);
    } else if (a.startsWith("-")) {
      fail(`Unknown flag: ${a}`);
    } else {
      rest.push(a);
    }
  }

  if (!opts.productId && rest[0]) opts.productId = rest[0];
  if (!opts.productId) fail("Missing product id. Use --product <id>");
  return opts;
}

/** Pure path helper: product id from filename; skip `_` prefixes. */
export function productIdFromFilename(name: string): string | null {
  if (!name.endsWith(".json")) return null;
  const id = name.slice(0, -".json".length);
  if (!id || id.startsWith("_")) return null;
  return id;
}

export function listProductIdsFromFs(root = ROOT): string[] {
  const dir = join(root, "content/products");
  return readdirSync(dir)
    .map(productIdFromFilename)
    .filter((id): id is string => Boolean(id))
    .sort();
}

/**
 * Load + Zod-validate product via filesystem (no Vite glob).
 * Same merge path as app `loadProduct`: mergeProductContent → parseProduct →
 * applyChromeDefaults.
 */
export function loadProductFromFs(productId: string, root = ROOT) {
  if (productId.startsWith("_")) {
    throw new Error(
      `Unknown product: ${productId} (_-prefixed templates are not exportable)`,
    );
  }
  const file = join(root, "content/products", `${productId}.json`);
  if (!existsSync(file)) {
    const known = listProductIdsFromFs(root).join(", ") || "(none)";
    throw new Error(`Unknown product: ${productId}. Known: ${known}`);
  }

  const raw = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;
  const brandPath = join(root, "content/brand/default.json");
  const brandDefault = brandConfigSchema.parse(
    JSON.parse(readFileSync(brandPath, "utf8")),
  );

  const merged = mergeProductContent(raw, brandDefault);
  const parsed = parseProduct(merged);
  return applyChromeDefaults(parsed);
}

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  let lastErr: unknown;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      // SPA may 200 on any path once preview is up; 404 still means server is listening
      if (res.ok || res.status === 404) return;
    } catch (e) {
      lastErr = e;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(
    `Preview server not ready at ${url} within ${timeoutMs}ms: ${String(lastErr)}. ` +
      `If the port is stuck, free :${EXPORT_PORT} (previous vite preview may still be running).`,
  );
}

/**
 * Spawn vite preview directly (not via `bun run`) in its own process group so
 * teardown can SIGTERM the whole tree and not leave :4173 occupied.
 */
function startPreview(root: string): ChildProcess {
  const viteJs = join(root, "node_modules", "vite", "bin", "vite.js");
  if (!existsSync(viteJs)) {
    fail(`vite binary missing at ${viteJs}; run bun install`);
  }

  const child = spawn(
    process.execPath,
    [
      viteJs,
      "preview",
      "--port",
      String(EXPORT_PORT),
      "--strictPort",
      "--host",
      "127.0.0.1",
    ],
    {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env },
      // Own process group → kill(-pid) reaps vite children
      detached: process.platform !== "win32",
    },
  );
  child.stdout?.on("data", (buf: Buffer) => {
    const s = buf.toString();
    if (process.env.EXPORT_DEBUG) process.stdout.write(`[preview] ${s}`);
  });
  child.stderr?.on("data", (buf: Buffer) => {
    const s = buf.toString();
    if (process.env.EXPORT_DEBUG) process.stderr.write(`[preview] ${s}`);
    if (/EADDRINUSE|already in use|StrictPort/i.test(s)) {
      console.error(
        `ERROR: port ${EXPORT_PORT} in use — stop the other preview or set a free port.`,
      );
    }
  });
  return child;
}

function killProcessTree(child: ChildProcess, signal: NodeJS.Signals): void {
  if (child.pid == null) return;
  try {
    if (process.platform !== "win32" && child.pid) {
      // Negative PID = process group (requires detached spawn)
      process.kill(-child.pid, signal);
      return;
    }
  } catch {
    /* fall through to single-process kill */
  }
  try {
    child.kill(signal);
  } catch {
    /* ignore */
  }
}

async function stopPreview(child: ChildProcess | null): Promise<void> {
  if (!child || child.killed) return;
  killProcessTree(child, "SIGTERM");
  await new Promise<void>((resolveDone) => {
    const t = setTimeout(() => {
      killProcessTree(child, "SIGKILL");
      resolveDone();
    }, 3000);
    child.once("exit", () => {
      clearTimeout(t);
      resolveDone();
    });
  });
}

async function waitFontsReady(
  page: import("playwright").Page,
): Promise<void> {
  await Promise.race([
    page.evaluate(() => document.fonts.ready.then(() => true)),
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `document.fonts.ready timed out after ${FONTS_READY_TIMEOUT_MS}ms`,
            ),
          ),
        FONTS_READY_TIMEOUT_MS,
      ),
    ),
  ]);
}

async function gotoAndMeasure(
  page: import("playwright").Page,
  url: string,
): Promise<OverflowMeasure> {
  await page.goto(url, {
    waitUntil: "load",
    timeout: PAGE_LOAD_TIMEOUT_MS,
  });
  await page.locator("[data-page=a4]").waitFor({ state: "visible", timeout: 10_000 });
  await waitFontsReady(page);
  // Run measure from source string so tsx/esbuild helpers never enter Chromium.
  return page.evaluate(
    ({ source, opts }) => {
      // eslint-disable-next-line no-eval -- measure source isolated from Node tooling
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

/**
 * Apply metadata and verify MediaBox. Writes PDF only when MediaBox is OK
 * (or when forceWrite is true after a soft check — not used currently).
 *
 * Note: pdf-lib overwrites PDF Producer on save with its own banner; we set
 * Creator to poster_business-export (that field sticks). See README.
 */
async function writePdfWithMetadata(
  pdfBytes: Buffer,
  title: string,
  outPath: string,
): Promise<{
  bytes: number;
  mediaBoxOk: boolean;
  widthMm: number;
  heightMm: number;
}> {
  const doc = await PDFDocument.load(pdfBytes);
  doc.setTitle(title);
  // Creator is the reliable tool stamp; Producer is forced to pdf-lib on save.
  doc.setCreator(PDF_CREATOR);

  const pages = doc.getPages();
  if (pages.length < 1) {
    throw new Error("PDF has no pages");
  }
  const { width, height } = pages[0].getSize();
  const box = checkA4MediaBox(width, height);

  if (!box.ok) {
    // Do not leave a bad PDF under output/ for CI collectors to pick up.
    if (existsSync(outPath)) {
      try {
        unlinkSync(outPath);
      } catch {
        /* ignore */
      }
    }
    return {
      bytes: 0,
      mediaBoxOk: false,
      widthMm: box.widthMm,
      heightMm: box.heightMm,
    };
  }

  const out = await doc.save();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, out);

  return {
    bytes: out.byteLength,
    mediaBoxOk: true,
    widthMm: box.widthMm,
    heightMm: box.heightMm,
  };
}

/**
 * Export a single product. Exported for export-all and tests.
 */
export async function exportProduct(
  options: ExportOptions,
): Promise<ExportResult> {
  const started = Date.now();
  const productId = options.productId;
  const content = loadProductFromFs(productId, ROOT);
  const title = documentTitleFromMeta(content.meta.documentTitle);
  const outPath =
    options.outPath ?? join(ROOT, "output", `${productId}.pdf`);
  const failDir = join(ROOT, "output", "failures");

  const playwrightPkg = require("playwright/package.json") as { version: string };
  log(`export: product=${productId}`);
  log(`export: Playwright ${playwrightPkg.version}`);

  if (!options.skipBuild) {
    log("export: building…");
    execSync("bun run build", { cwd: ROOT, stdio: options.quiet ? "pipe" : "inherit" });
  } else if (!existsSync(join(ROOT, "dist"))) {
    fail("dist/ missing; run without --skip-build or bun run build first");
  }

  let preview: ChildProcess | null = null;
  const base = options.baseUrl ?? EXPORT_ORIGIN;

  try {
    if (!options.baseUrl) {
      preview = startPreview(ROOT);
      try {
        await waitForServer(base, SERVER_READY_TIMEOUT_MS);
      } catch (err) {
        await stopPreview(preview);
        preview = null;
        throw err;
      }
      // Spawn may have died (e.g. EADDRINUSE) while an old process still answered HTTP
      if (preview.exitCode !== null || preview.signalCode !== null) {
        const code = preview.exitCode ?? preview.signalCode;
        await stopPreview(preview);
        preview = null;
        throw new Error(
          `Preview process exited before export (code/signal=${String(code)}). ` +
            `Port ${EXPORT_PORT} is likely held by another vite preview — free it and retry.`,
        );
      }
      log(`export: preview ready at ${base}`);
    }

    const browser = await chromium.launch({ headless: true });
    try {
      const chromiumVersion = browser.version();
      log(`export: Chromium ${chromiumVersion}`);

      const context = await browser.newContext({
        viewport: { width: 1200, height: 1600 },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();

      const normalUrl = printUrl(productId, { export: true });
      const urlNormal = options.baseUrl
        ? `${options.baseUrl.replace(/\/$/, "")}/print/${encodeURIComponent(productId)}?export=1`
        : normalUrl;

      let measure = await gotoAndMeasure(page, urlNormal);
      let usedCompact = content.layout?.density === "compact";

      log(
        `export: measure normal overflows=${measure.overflows} deltaMm=${measure.deltaMm.toFixed(3)} worst=${measure.worstSelector}`,
      );

      if (measure.overflows) {
        const compactUrl = options.baseUrl
          ? `${options.baseUrl.replace(/\/$/, "")}/print/${encodeURIComponent(productId)}?export=1&density=compact`
          : printUrl(productId, { export: true, density: "compact" });
        measure = await gotoAndMeasure(page, compactUrl);
        usedCompact = true;
        log(
          `export: measure compact overflows=${measure.overflows} deltaMm=${measure.deltaMm.toFixed(3)} worst=${measure.worstSelector}`,
        );
      }

      const overflows = measure.overflows;

      if (overflows && !options.force) {
        mkdirSync(failDir, { recursive: true });
        const shotPath = join(failDir, `${productId}.png`);
        await page.screenshot({ path: shotPath, fullPage: true });
        log(`export: OVERFLOW — screenshot ${shotPath}`);
        const durationMs = Date.now() - started;
        log(`export: duration ${durationMs}ms (failed)`);
        return {
          productId,
          pdfPath: null,
          bytes: 0,
          durationMs,
          usedCompact,
          overflow: measure,
          mediaBoxOk: null,
          forced: false,
        };
      }

      if (overflows && options.force) {
        log("export: WARNING — overflow detected; writing PDF anyway (--force)");
        if (usedCompact) {
          const compactUrl = options.baseUrl
            ? `${options.baseUrl.replace(/\/$/, "")}/print/${encodeURIComponent(productId)}?export=1&density=compact`
            : printUrl(productId, { export: true, density: "compact" });
          await gotoAndMeasure(page, compactUrl);
        }
      }

      const pdfBuffer = await page.pdf({
        format: "A4",
        preferCSSPageSize: true,
        printBackground: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
        scale: 1,
        landscape: false,
      });

      const resolvedOut = resolve(outPath);
      const meta = await writePdfWithMetadata(
        Buffer.from(pdfBuffer),
        title,
        resolvedOut,
      );

      const durationMs = Date.now() - started;

      if (!meta.mediaBoxOk) {
        log(
          `export: MediaBox check failed ${meta.widthMm.toFixed(3)}×${meta.heightMm.toFixed(3)}mm (no file written)`,
        );
        throw new Error(
          `MediaBox not A4: ${meta.widthMm.toFixed(3)}×${meta.heightMm.toFixed(3)} mm ` +
            `(expected ${A4_WIDTH_MM}×${A4_HEIGHT_MM} ±${A4_MEDIABOX_TOLERANCE_MM} mm)`,
        );
      }

      log(
        `export: wrote ${outPath} (${meta.bytes} bytes) mediaBox=${meta.widthMm.toFixed(2)}×${meta.heightMm.toFixed(2)}mm ok=${meta.mediaBoxOk} compact=${usedCompact} duration=${durationMs}ms`,
      );

      return {
        productId,
        pdfPath: resolvedOut,
        bytes: meta.bytes,
        durationMs,
        usedCompact,
        overflow: measure,
        mediaBoxOk: meta.mediaBoxOk,
        forced: Boolean(overflows && options.force),
      };
    } finally {
      await browser.close();
    }
  } finally {
    await stopPreview(preview);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  try {
    const result = await exportProduct(opts);
    if (!result.pdfPath) {
      process.exitCode = 1;
      return;
    }
  } catch (err) {
    console.error(err instanceof Error ? err.stack ?? err.message : err);
    process.exitCode = 1;
  }
}

const isDirect =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirect) {
  void main();
}
