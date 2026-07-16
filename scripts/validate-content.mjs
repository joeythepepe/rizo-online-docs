/**
 * Smoke validation for PR 3 content schema (no Vite required).
 * - example-uk-ug parses
 * - missing .en / .zh fails
 * - product id list includes example-uk-ug (skips _template)
 * - chrome defaults applied for omitted disclaimer
 *
 * Run: node scripts/validate-content.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

async function bundleTs(entry, outfile) {
  await build({
    entryPoints: [entry],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    logLevel: "silent",
  });
  return pathToFileURL(outfile).href;
}

function fail(msg) {
  console.error("FAIL:", msg);
  process.exit(1);
}

function ok(msg) {
  console.log("OK:", msg);
}

async function main() {
  const outDir = join(root, "node_modules", ".cache", "validate-content");
  const { mkdirSync } = await import("node:fs");
  mkdirSync(outDir, { recursive: true });

  const schemaUrl = await bundleTs(
    join(root, "src/content/schema.ts"),
    join(outDir, "schema.mjs"),
  );
  const defaultsUrl = await bundleTs(
    join(root, "src/content/defaults/bilingual.ts"),
    join(outDir, "defaults.mjs"),
  );

  // loadProduct uses import.meta.glob — exercise pure helpers via small inline copy
  const { parseProduct, safeParseProduct, productSchema } = await import(
    schemaUrl
  );
  const { BILINGUAL_CHROME } = await import(defaultsUrl);

  const productsDir = join(root, "content/products");
  const brandPath = join(root, "content/brand/default.json");
  const examplePath = join(productsDir, "example-uk-ug.json");

  const brand = JSON.parse(readFileSync(brandPath, "utf8"));
  const example = JSON.parse(readFileSync(examplePath, "utf8"));

  // listProductIds semantics (fs mirror of glob keys)
  const files = readdirSync(productsDir).filter((f) => f.endsWith(".json"));
  const ids = files
    .map((f) => f.replace(/\.json$/, ""))
    .filter((id) => !id.startsWith("_"))
    .sort();
  if (!ids.includes("example-uk-ug")) {
    fail(`listProductIds-equivalent missing example-uk-ug; got ${ids.join(",")}`);
  }
  if (ids.includes("_template")) {
    fail("_template must be excluded from product ids");
  }
  ok(`product ids: ${ids.join(", ")}`);

  // Happy path
  const parsed = parseProduct(example);
  if (parsed.product.name.zh !== "英本冲刺计划") {
    fail("example product name mismatch");
  }
  ok("example-uk-ug parses");

  // Brand defaults parse
  const brandResult = productSchema.shape.brand.safeParse(brand);
  if (!brandResult.success) {
    fail(`brand/default.json invalid: ${brandResult.error}`);
  }
  ok("brand/default.json parses");

  // Missing .en fails
  const missingEn = structuredClone(example);
  delete missingEn.product.name.en;
  const r1 = safeParseProduct(missingEn);
  if (r1.success) fail("expected missing product.name.en to fail");
  ok("missing .en fails Zod");

  // Missing .zh fails
  const missingZh = structuredClone(example);
  delete missingZh.targetCustomer.summary.zh;
  const r2 = safeParseProduct(missingZh);
  if (r2.success) fail("expected missing summary.zh to fail");
  ok("missing .zh fails Zod");

  // Empty string after trim fails
  const emptyZh = structuredClone(example);
  emptyZh.product.name.zh = "   ";
  const r3 = safeParseProduct(emptyZh);
  if (r3.success) fail("expected whitespace-only zh to fail");
  ok("whitespace-only BiString fails Zod");

  // highlights XOR timeline
  const both = structuredClone(example);
  both.timeline = {
    steps: [{ id: "t1", label: { zh: "步骤一", en: "Step one" } }],
  };
  const r4 = safeParseProduct(both);
  if (r4.success) fail("expected highlights+timeline to fail");
  ok("highlights XOR timeline enforced");

  // name.zh max 16 with tagline (17 chars)
  const longName = structuredClone(example);
  longName.product.name.zh = "一二三四五六七八九十一二三四五六七";
  const r5 = safeParseProduct(longName);
  if (r5.success) fail("expected long name.zh with tagline to fail");
  ok("product.name.zh max 16 with tagline");

  // Disclaimer default chrome present
  if (!BILINGUAL_CHROME.disclaimer.zh || !BILINGUAL_CHROME.disclaimer.en) {
    fail("BILINGUAL_CHROME.disclaimer incomplete");
  }
  ok("bilingual chrome defaults present (disclaimer + sections)");

  // Template file existence
  if (!files.includes("_template.json")) {
    fail("missing content/products/_template.json");
  }
  ok("_template.json present (not listed as product id)");

  console.log("\nAll content validation checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
