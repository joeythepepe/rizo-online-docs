/**
 * Smoke validation for content schema + loader (Chinese-only strings).
 * Run: bun run validate:content
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
      mergeZhString,
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
      readFileSync(join(root, "content/products/gaokao-uk.json"), "utf8"),
    );
    const brand = JSON.parse(
      readFileSync(join(root, "content/brand/default.json"), "utf8"),
    );

    const ids = listProductIds();
    if (!ids.includes("gaokao-uk")) {
      fail(`listProductIds missing gaokao-uk, got ${JSON.stringify(ids)}`);
    }
    if (!ids.includes("gaokao-hongkong")) {
      fail(`listProductIds missing gaokao-hongkong, got ${JSON.stringify(ids)}`);
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

    const loaded = loadProduct("gaokao-uk");
    if (loaded.product.name !== "高考通英国") {
      fail("loadProduct example name mismatch");
    }
    if (loaded.meta.disclaimer !== BILINGUAL_CHROME.disclaimer) {
      fail("loadProduct did not apply default disclaimer");
    }
    if (loaded.targetCustomer.title !== "适合人群") {
      fail("loadProduct missing target section chrome default");
    }
    if (loaded.deliverables.title !== "服务内容") {
      fail("loadProduct missing deliverables chrome default");
    }
    if (loaded.requirements.title !== "客户需具备") {
      fail("loadProduct missing requirements chrome default");
    }
    ok("loadProduct('gaokao-uk') applies chrome defaults");

    const brandDefaults = getBrandDefaults();
    const noBrand = structuredClone(example);
    delete noBrand.brand;
    const mergedNoBrand = mergeProductContent(noBrand, brandDefaults);
    const parsedNoBrand = parseProduct(mergedNoBrand);
    if (parsedNoBrand.brand.companyName !== brand.companyName) {
      fail("brand defaults not applied when product omits brand");
    }
    ok("mergeProductContent fills brand from defaults when omitted");

    const merged = mergeZhString("新公司", "默认公司");
    if (merged !== "新公司") {
      fail(`mergeZhString failed: ${merged}`);
    }
    if (mergeZhString("  ", "默认公司") !== "默认公司") {
      fail("mergeZhString should fall back on whitespace primary");
    }
    ok("mergeZhString product wins / fallback works");

    const parsedExample = parseProduct(example);
    ok("gaokao-uk parses");
    if (parsedExample.layout?.variant !== "split") {
      fail(
        `gaokao-uk must use layout.variant=split, got ${JSON.stringify(parsedExample.layout)}`,
      );
    }
    ok("gaokao-uk uses split layout");

    for (const id of [
      "gaokao-hongkong",
      "gaokao-macao",
      "gaokao-singapore",
      "gaokao-uk",
      "gaokao-usa",
      "gaokao-canada",
      "gaokao-japan",
      "gaokao-korea",
      "gaokao-malaysia",
      "gaokao-australia",
      "gaokao-newzealand",
      "gaokao-netherlands",
      "gaokao-germany",
      "gaokao-ireland",
    ]) {
      const p = loadProduct(id);
      if (!p.product.name || typeof p.product.name !== "string") {
        fail(`${id} name must be Chinese string`);
      }
      ok(`loadProduct('${id}') ok — ${p.product.name}`);
    }

    const brandResult = brandConfigSchema.safeParse(brand);
    if (!brandResult.success) {
      fail(`brand/default.json invalid: ${brandResult.error}`);
    }
    ok("brand/default.json parses");

    // Reject legacy { zh, en } shape
    const legacy = structuredClone(example);
    legacy.product.name = { zh: "测试", en: "Test" };
    if (safeParseProduct(legacy).success) {
      fail("expected BiString object name to fail");
    }
    ok("legacy {zh,en} name fails Zod");

    const emptyName = structuredClone(example);
    emptyName.product.name = "   ";
    if (safeParseProduct(emptyName).success) {
      fail("expected whitespace-only name to fail");
    }
    ok("whitespace-only string fails Zod");

    const both = structuredClone(example);
    both.timeline = {
      steps: [{ id: "t1", label: "步骤一" }],
    };
    if (safeParseProduct(both).success) {
      fail("expected highlights+timeline to fail");
    }
    ok("highlights XOR timeline enforced");

    const name16Tag = structuredClone(example);
    name16Tag.product.name = "一二三四五六七八九十一二三四五六"; // 16
    if (chars(name16Tag.product.name) !== 16) fail("setup 16 chars");
    if (!safeParseProduct(name16Tag).success) {
      fail("expected name length 16 with tagline to pass");
    }
    ok("name length 16 with tagline passes");

    const name17Tag = structuredClone(example);
    name17Tag.product.name = "一二三四五六七八九十一二三四五六七"; // 17
    if (safeParseProduct(name17Tag).success) {
      fail("expected name length 17 with tagline to fail");
    }
    ok("name length 17 with tagline fails");

    const name17NoTag = structuredClone(example);
    delete name17NoTag.product.tagline;
    name17NoTag.product.name = "一二三四五六七八九十一二三四五六七";
    if (!safeParseProduct(name17NoTag).success) {
      fail("expected name length 17 without tagline to pass");
    }
    ok("name length 17 without tagline passes");

    const noMandatory = structuredClone(example);
    for (const item of noMandatory.requirements.items) {
      delete item.mandatory;
    }
    const reqParsed = parseProduct(noMandatory);
    if (!reqParsed.requirements.items.every((i) => i.mandatory === true)) {
      fail("requirements.mandatory should default to true");
    }
    ok("requirements.mandatory defaults to true");

    const bare = structuredClone(example);
    delete bare.meta.disclaimer;
    const withChrome = applyChromeDefaults(parseProduct(bare));
    if (!withChrome.meta.disclaimer) {
      fail("applyChromeDefaults did not set disclaimer");
    }
    ok("applyChromeDefaults fills omitted disclaimer");

    if (typeof productSchema.parse !== "function") fail("productSchema missing");
    if (typeof getBrandDefaults().companyName !== "string") {
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
