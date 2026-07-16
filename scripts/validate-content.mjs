/**
 * Smoke validation for PR 3 content schema + loader.
 * Uses Vite `ssrLoadModule` so `import.meta.glob` and real `loadProduct` /
 * `listProductIds` are exercised (no undeclared esbuild dependency).
 *
 * Run: node scripts/validate-content.mjs  (or pnpm validate:content)
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function fail(msg) {
  console.error("FAIL:", msg);
  process.exit(1);
}

function ok(msg) {
  console.log("OK:", msg);
}

function chars(s) {
  return [...s].length;
}

async function main() {
  const server = await createServer({
    root,
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  });

  try {
    const {
      listProductIds,
      loadProduct,
      mergeProductContent,
      applyChromeDefaults,
      mergeBiString,
      getBrandDefaults,
      listProductIdsFromKeys,
      productIdFromPath,
    } = await server.ssrLoadModule("/src/content/loadProduct.ts");

    const { parseProduct, safeParseProduct, productSchema, brandConfigSchema } =
      await server.ssrLoadModule("/src/content/schema.ts");

    const { BILINGUAL_CHROME } = await server.ssrLoadModule(
      "/src/content/defaults/bilingual.ts",
    );

    const example = JSON.parse(
      readFileSync(join(root, "content/products/example-uk-ug.json"), "utf8"),
    );
    const brand = JSON.parse(
      readFileSync(join(root, "content/brand/default.json"), "utf8"),
    );

    // --- Real listProductIds / loadProduct (Vite glob) ---
    const ids = listProductIds();
    if (!ids.includes("example-uk-ug")) {
      fail(`listProductIds missing example-uk-ug, got ${JSON.stringify(ids)}`);
    }
    if (!ids.includes("fixture-overflow")) {
      fail(`listProductIds missing fixture-overflow, got ${JSON.stringify(ids)}`);
    }
    if (!ids.includes("fixture-overflow-compact")) {
      fail(
        `listProductIds missing fixture-overflow-compact, got ${JSON.stringify(ids)}`,
      );
    }
    if (ids.some((id) => id.startsWith("_"))) {
      fail(`listProductIds must skip _-prefixed, got ${JSON.stringify(ids)}`);
    }
    ok(`listProductIds(): ${JSON.stringify(ids)}`);

    if (productIdFromPath("content/products/_template.json") !== null) {
      fail("productIdFromPath must skip _template");
    }
    ok("productIdFromPath skips _-prefixed files");

    let templateLoadFailed = false;
    try {
      loadProduct("_template");
    } catch {
      templateLoadFailed = true;
    }
    if (!templateLoadFailed) {
      fail("loadProduct('_template') must throw");
    }
    ok("loadProduct('_template') rejected");

    const loaded = loadProduct("example-uk-ug");
    if (loaded.product.name.zh !== "英本冲刺计划") {
      fail("loadProduct example name mismatch");
    }
    if (
      loaded.meta.disclaimer?.zh !== BILINGUAL_CHROME.disclaimer.zh ||
      loaded.meta.disclaimer?.en !== BILINGUAL_CHROME.disclaimer.en
    ) {
      fail("loadProduct did not apply default disclaimer");
    }
    if (loaded.targetCustomer.title?.zh !== "适合人群") {
      fail("loadProduct missing target section chrome default");
    }
    if (loaded.deliverables.title?.zh !== "服务内容") {
      fail("loadProduct missing deliverables chrome default");
    }
    if (loaded.requirements.title?.zh !== "客户需具备") {
      fail("loadProduct missing requirements chrome default");
    }
    if (loaded.highlights?.title?.zh !== "方案要点") {
      fail("loadProduct missing highlights chrome default");
    }
    ok("loadProduct('example-uk-ug') applies chrome defaults");

    // Brand fill when product omits brand
    const noBrand = structuredClone(example);
    delete noBrand.brand;
    const brandDefaults = getBrandDefaults();
    const mergedNoBrand = mergeProductContent(noBrand, brandDefaults);
    const parsedNoBrand = parseProduct(mergedNoBrand);
    if (parsedNoBrand.brand.companyName.zh !== brand.companyName.zh) {
      fail("brand defaults not applied when product omits brand");
    }
    ok("mergeProductContent fills brand from defaults when omitted");

    // Deep-merge BiString: product zh + brand en
    const partialCompany = mergeBiString(
      { zh: "新公司" },
      { zh: "示例升学咨询", en: "Example Admissions Consulting" },
    );
    if (
      partialCompany?.zh !== "新公司" ||
      partialCompany?.en !== "Example Admissions Consulting"
    ) {
      fail(`mergeBiString partial failed: ${JSON.stringify(partialCompany)}`);
    }
    ok("mergeBiString deep-merges per language");

    const partialCtaProduct = structuredClone(example);
    partialCtaProduct.brand = {
      companyName: brand.companyName,
      ctaLabel: { zh: "立即预约" },
    };
    const mergedCta = mergeProductContent(partialCtaProduct, brandDefaults);
    const brandAfter = mergedCta.brand;
    if (
      brandAfter.ctaLabel?.zh !== "立即预约" ||
      brandAfter.ctaLabel?.en !== brand.ctaLabel.en
    ) {
      fail(`partial ctaLabel merge failed: ${JSON.stringify(brandAfter.ctaLabel)}`);
    }
    ok("product partial ctaLabel.zh keeps brand .en");

    // --- Schema hard limits ---
    const parsed = parseProduct(example);
    if (parsed.product.name.zh !== "英本冲刺计划") {
      fail("example product name mismatch");
    }
    ok("example-uk-ug parses");

    const brandResult = brandConfigSchema.safeParse(brand);
    if (!brandResult.success) {
      fail(`brand/default.json invalid: ${brandResult.error}`);
    }
    ok("brand/default.json parses");

    const missingEn = structuredClone(example);
    delete missingEn.product.name.en;
    if (safeParseProduct(missingEn).success) {
      fail("expected missing product.name.en to fail");
    }
    ok("missing .en fails Zod");

    const missingZh = structuredClone(example);
    delete missingZh.targetCustomer.summary.zh;
    if (safeParseProduct(missingZh).success) {
      fail("expected missing summary.zh to fail");
    }
    ok("missing .zh fails Zod");

    const emptyZh = structuredClone(example);
    emptyZh.product.name.zh = "   ";
    if (safeParseProduct(emptyZh).success) {
      fail("expected whitespace-only zh to fail");
    }
    ok("whitespace-only BiString fails Zod");

    const both = structuredClone(example);
    both.timeline = {
      steps: [{ id: "t1", label: { zh: "步骤一", en: "Step one" } }],
    };
    if (safeParseProduct(both).success) {
      fail("expected highlights+timeline to fail");
    }
    ok("highlights XOR timeline enforced");

    // name.zh boundaries
    const name16Tag = structuredClone(example);
    name16Tag.product.name.zh = "一二三四五六七八九十一二三四五六"; // 16
    if (chars(name16Tag.product.name.zh) !== 16) {
      fail(`setup: expected 16 chars, got ${chars(name16Tag.product.name.zh)}`);
    }
    if (!safeParseProduct(name16Tag).success) {
      fail("expected name.zh length 16 with tagline to pass");
    }
    ok("name.zh length 16 with tagline passes");

    const name17Tag = structuredClone(example);
    name17Tag.product.name.zh = "一二三四五六七八九十一二三四五六七"; // 17
    if (safeParseProduct(name17Tag).success) {
      fail("expected name.zh length 17 with tagline to fail");
    }
    ok("name.zh length 17 with tagline fails");

    const name17NoTag = structuredClone(example);
    delete name17NoTag.product.tagline;
    name17NoTag.product.name.zh = "一二三四五六七八九十一二三四五六七"; // 17
    if (!safeParseProduct(name17NoTag).success) {
      fail("expected name.zh length 17 without tagline to pass");
    }
    ok("name.zh length 17 without tagline passes");

    const name25NoTag = structuredClone(example);
    delete name25NoTag.product.tagline;
    name25NoTag.product.name.zh = "一二三四五六七八九十一二三四五六七八九十一二三四五"; // 25
    if (chars(name25NoTag.product.name.zh) !== 25) {
      fail(`setup: expected 25 chars, got ${chars(name25NoTag.product.name.zh)}`);
    }
    if (safeParseProduct(name25NoTag).success) {
      fail("expected name.zh length 25 without tagline to fail");
    }
    ok("name.zh length 25 without tagline fails");

    // requirements mandatory default
    const noMandatory = structuredClone(example);
    for (const item of noMandatory.requirements.items) {
      delete item.mandatory;
    }
    const reqParsed = parseProduct(noMandatory);
    if (!reqParsed.requirements.items.every((i) => i.mandatory === true)) {
      fail("requirements.mandatory should default to true");
    }
    ok("requirements.mandatory defaults to true");

    // pure helpers
    const fromKeys = listProductIdsFromKeys([
      "../../content/products/example-uk-ug.json",
      "../../content/products/fixture-overflow.json",
      "../../content/products/_template.json",
    ]);
    if (
      JSON.stringify(fromKeys) !==
      JSON.stringify(["example-uk-ug", "fixture-overflow"])
    ) {
      fail(`listProductIdsFromKeys failed: ${JSON.stringify(fromKeys)}`);
    }
    ok("listProductIdsFromKeys pure helper");

    // Overflow fixtures must parse (export CLI fails on layout measure, not Zod)
    const overflowRaw = JSON.parse(
      readFileSync(join(root, "content/products/fixture-overflow.json"), "utf8"),
    );
    if (!safeParseProduct(overflowRaw).success) {
      fail(`fixture-overflow.json failed Zod: ${safeParseProduct(overflowRaw).error}`);
    }
    ok("fixture-overflow.json parses");

    const overflowCompactRaw = JSON.parse(
      readFileSync(
        join(root, "content/products/fixture-overflow-compact.json"),
        "utf8",
      ),
    );
    const overflowCompactParse = safeParseProduct(overflowCompactRaw);
    if (!overflowCompactParse.success) {
      fail(
        `fixture-overflow-compact.json failed Zod: ${overflowCompactParse.error}`,
      );
    }
    if (overflowCompactParse.data.layout?.density !== "compact") {
      fail(
        `fixture-overflow-compact must set layout.density === "compact", got ${JSON.stringify(overflowCompactParse.data.layout?.density)}`,
      );
    }
    ok("fixture-overflow-compact.json parses with density=compact");

    // applyChromeDefaults on parsed without titles/disclaimer
    const bare = structuredClone(example);
    delete bare.meta.disclaimer;
    const withChrome = applyChromeDefaults(parseProduct(bare));
    if (!withChrome.meta.disclaimer?.zh || !withChrome.meta.disclaimer?.en) {
      fail("applyChromeDefaults did not set disclaimer");
    }
    ok("applyChromeDefaults fills omitted disclaimer");

    if (!BILINGUAL_CHROME.disclaimer.zh || !BILINGUAL_CHROME.disclaimer.en) {
      fail("BILINGUAL_CHROME.disclaimer incomplete");
    }
    ok("bilingual chrome defaults present");

    // brandConfigSchema / productSchema still importable
    if (typeof productSchema.parse !== "function") {
      fail("productSchema missing");
    }
    if (typeof getBrandDefaults().companyName.zh !== "string") {
      fail("getBrandDefaults broken");
    }
    ok("schema + brand defaults module exports ok");

    console.log("\nAll content validation checks passed.");
  } finally {
    await server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
