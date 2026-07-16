/**
 * Export every product under content/products/*.json (skips _-prefixed).
 * Skips `fixture-overflow*` by default (intentional fail); include with --force.
 *
 * Usage:
 *   bun run export:all
 *   bun run export:all --skip-build
 *   bun run export:all --force
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { exportProduct, listProductIdsFromFs } from "./export-pdf.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function parseFlags(argv: string[]) {
  return {
    skipBuild: argv.includes("--skip-build"),
    force: argv.includes("--force") || argv.includes("-f"),
  };
}

async function main() {
  const flags = parseFlags(process.argv.slice(2));
  const ids = listProductIdsFromFs(ROOT).filter(
    (id) => flags.force || !id.startsWith("fixture-overflow"),
  );

  if (ids.length === 0) {
    console.error("No products found under content/products/");
    process.exitCode = 1;
    return;
  }

  console.log(`export-all: ${ids.length} product(s): ${ids.join(", ")}`);

  let failed = 0;
  let built = false;

  for (const id of ids) {
    console.log(`\n── ${id} ──`);
    try {
      const result = await exportProduct({
        productId: id,
        skipBuild: built || flags.skipBuild,
        force: flags.force,
      });
      built = true;
      if (!result.pdfPath) {
        console.error(`FAILED: ${id} (overflow)`);
        failed++;
      }
    } catch (err) {
      console.error(
        `FAILED: ${id}`,
        err instanceof Error ? err.message : err,
      );
      failed++;
      built = true;
    }
  }

  if (failed > 0) {
    console.error(`\nexport-all: ${failed}/${ids.length} failed`);
    process.exitCode = 1;
  } else {
    console.log(`\nexport-all: all ${ids.length} ok`);
  }
}

main();
