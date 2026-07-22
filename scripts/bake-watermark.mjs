/**
 * Bake a single A4 matrix watermark SVG from public/brand/logo.svg.
 *
 * Logo is inlined once as a <symbol>; matrix is expanded to explicit <use>
 * tiles (not CSS/SVG pattern) so it paints reliably when loaded as <img>.
 *
 *   bun run brand:watermark
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LOGO = join(ROOT, "public/brand/logo.svg");
const OUT = join(ROOT, "public/brand/watermark-matrix.svg");

/** A4 in mm — viewBox units = mm */
const PAGE_W = 210;
const PAGE_H = 297;

/** Pattern cell (mm) — tighter matrix */
const CELL_W = 48;
const CELL_H = 28;

/** Logo draw size inside each cell (mm); aspect ~378:51 */
const LOGO_W = 40;
const LOGO_H = (51 / 378) * LOGO_W;

/** Classic watermark tilt (deg) */
const ROTATE = -22;

/** Per-mark opacity — stronger for print/PDF readability */
const OPACITY = 0.14;

const raw = readFileSync(LOGO, "utf8");

const inner = raw
  .replace(/<\?xml[^>]*>/i, "")
  .replace(/<svg[^>]*>/i, "")
  .replace(/<\/svg>\s*$/i, "")
  .replace(/\sfill="#[0-9A-Fa-f]{3,8}"/g, ' fill="#1E1E1E"')
  .trim();

const logoViewBox = (() => {
  const m = raw.match(/viewBox=["']([^"']+)["']/i);
  return m ? m[1] : "0 0 378 51";
})();

// Expand tiles past page bounds so rotation still covers full A4.
const pad = 80;
const startX = -pad;
const startY = -pad;
const endX = PAGE_W + pad;
const endY = PAGE_H + pad;

const ox = (CELL_W - LOGO_W) / 2;
const oy = (CELL_H - LOGO_H) / 2;

const tiles = [];
for (let y = startY, row = 0; y < endY; y += CELL_H, row++) {
  // Slight horizontal stagger every other row for denser matrix feel
  const x0 = startX + (row % 2 === 0 ? 0 : CELL_W / 2);
  for (let x = x0; x < endX; x += CELL_W) {
    tiles.push(
      `    <use href="#rizo-logo" xlink:href="#rizo-logo" x="${(x + ox).toFixed(2)}" y="${(y + oy).toFixed(2)}" width="${LOGO_W}" height="${LOGO_H.toFixed(3)}" opacity="${OPACITY}"/>`,
    );
  }
}

// Pixel size at 96dpi so <img> reports naturalWidth/Height correctly.
const PX_W = Math.round((PAGE_W / 25.4) * 96);
const PX_H = Math.round((PAGE_H / 25.4) * 96);

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Baked PDF watermark — do not edit by hand.
  Regenerate: bun run brand:watermark
  Source: public/brand/logo.svg
  Tiles: ${tiles.length} (matrix), rotate ${ROTATE}°, opacity ${OPACITY}
-->
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${PX_W}" height="${PX_H}"
     viewBox="0 0 ${PAGE_W} ${PAGE_H}"
     preserveAspectRatio="none">
  <defs>
    <symbol id="rizo-logo" viewBox="${logoViewBox}">
${inner}
    </symbol>
  </defs>
  <g transform="rotate(${ROTATE} ${PAGE_W / 2} ${PAGE_H / 2})">
${tiles.join("\n")}
  </g>
</svg>
`;

writeFileSync(OUT, svg, "utf8");
console.log(
  `Wrote ${OUT} (${Buffer.byteLength(svg)} bytes) tiles=${tiles.length} cell=${CELL_W}×${CELL_H}mm logo=${LOGO_W}×${LOGO_H.toFixed(2)}mm rot=${ROTATE}° opacity=${OPACITY}`,
);
