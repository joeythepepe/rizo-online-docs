# A4 Print Template System

Premium A4 print templates for China-mainland education consulting materials (full bilingual CN+EN). Built with **Bun + Vite + React + TypeScript + Tailwind CSS**.

See [DESIGN.md](./DESIGN.md) for the full design specification.

## Quick start

```bash
bun install
bun run dev
```

- **Dev server:** Vite on the default port (usually `http://localhost:5173`)
- **Typecheck:** `bun run typecheck`
- **Print class denylist:** `bun run check:print-classes`
- **Font subset (Noto SC):** `bun run fonts:subset` — see [fonts/README.md](./fonts/README.md)
- **Validate product JSON:** `bun run validate:content`
- **Production build:** `bun run build`
- **Preview build:** `bun run preview`
- **Export PDF:** `bun run export:pdf --product gaokao-uk` → `output/<id>.pdf`
- **Export all products:** `bun run export:all` (skips overflow fixtures)
- **Screenshot smoke:** `bun run test:smoke` → builds, previews, asserts example product A4 + writes `output/smoke/*.png`

First-time PDF export / smoke needs Chromium for Playwright:

```bash
bunx playwright install chromium
```

## Frozen design tokens

Templates must use the frozen tokens only (defined in `tailwind.config.ts` and `src/design-tokens/print.css`).

### Colors

Use **frozen colors only** in print templates — do not use default Tailwind palette utilities (`text-gray-*`, `bg-blue-*`, etc.).

| Token | Hex | Utilities |
|-------|-----|-----------|
| `paper` | `#FFFFFF` | `bg-paper` |
| `ink` | `#1D1D1F` | `text-ink` |
| `ink-secondary` | `#6E6E73` | `text-ink-secondary` |
| `ink-tertiary` | `#86868B` | `text-ink-tertiary` |
| `rule` | `#D2D2D7` | `border-rule` |
| `accent` | `#0071E3` | `text-accent`, `bg-accent` |
| `soft` | `#F5F5F7` | `bg-soft` |

### Type scale

Weights **400 / 500 / 700 only**. Classes: `text-print-display`, `text-print-title`, `text-print-body`, `text-print-body-sm`, `text-print-label`, `text-print-meta`, and EN variants `text-print-en-*`.

### Spacing (`mm-*` only)

| Token | Value | Example |
|-------|-------|---------|
| `mm-1` | 1mm | `gap-mm-1` |
| `mm-2` | 2mm | `gap-mm-2` |
| `mm-4` | 4mm | `gap-mm-4` |
| `mm-6` | 6mm | `mt-mm-6` |
| `mm-8` | 8mm | `p-mm-8` |
| `mm-12` | 12mm | `gap-mm-12` |
| `mm-14` | 14mm | `p-mm-14` |

Page size utilities: `w-a4` (210mm), `h-a4` (297mm). CSS shell: `.a4-page`, `.a4-safe` with `@page { size: A4; margin: 0 }`.

## Forbidden utilities in print templates

**Do not use** the following in print templates (`src/templates/**`), print shell components (`src/components/**`), print routes (`/print/*`), or on `.a4-page` content:

| Forbidden | Reason |
|-----------|--------|
| Responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) | Print is fixed A4; no responsive reflow |
| `shadow-*`, `ring-*`, gradients (`bg-gradient-*`, etc.), `blur-*` | Not print-safe; break premium flat aesthetic |
| `font-semibold` / `font-weight: 600` | No SemiBold face shipped; would faux-bold in PDF |
| `min-h-screen`, `h-screen`, arbitrary `vh` for page height | Page height is fixed 297mm via `.a4-page` |
| Non-`mm-*` spacing for template layout | Use frozen `mm-*` scale only |
| Default Tailwind palette (`text-gray-*`, `bg-blue-*`, …) | Use frozen colors only |

Shadows and decorative chrome **are** allowed on gallery/screen routes (`/`, `/p/*`) outside the A4 page frame — not inside print roots.

**Enforcement (lightweight):** `bun run check:print-classes` runs `scripts/check-print-classes.sh`, which greps `src/templates/**` and `src/components/**` for breakpoints, `font-semibold`, shadows/rings/gradients/blur, and `min-h-screen` / `h-screen` / `vh`. (Dirs may be empty until later PRs; the script still exits 0.)

## PDF export

Canonical artifact is Playwright PDF (not browser Print → Save as PDF).

```bash
bun run export:pdf --product gaokao-uk
bun run export:pdf --product gaokao-uk --force   # debug: write PDF even if overflow
bun run export:all
```

Pipeline: Zod-validate `content/products/<id>.json` (same `mergeProductContent` → `parseProduct` → `applyChromeDefaults` as the app) → `bun run build` → `vite preview` on `127.0.0.1:4173` → open `/print/<id>?export=1` → wait `load` + `document.fonts.ready` → measure overflow on `[data-page=a4]` → one retry with `?density=compact` (real compact CSS) → on still-overflow write `output/failures/<id>.png` and exit 1 → else write `output/<id>.pdf`, set PDF **Creator** to `poster_business-export`, verify A4 MediaBox via **pdf-lib**.

**Metadata note:** pdf-lib overwrites the PDF **Producer** field on every `save()` with its own banner (`pdf-lib (https://github.com/Hopding/pdf-lib)`). The export tool stamps **Creator** (and document title) instead — trust Creator for tool identity.

### Screenshot smoke

```bash
bun run test:smoke
# or: bun run build && bunx playwright test
```

Happy path: `/print/gaokao-uk` shows Chinese content, measures no overflow, writes `output/smoke/gaokao-uk.png` (human-review artifact, not visual-diff baseline). Compact path (`?density=compact`) asserts `data-density=compact`, `text-print-body-sm` / SoftPanel padding classes, no overflow, and `output/smoke/gaokao-uk-compact.png`.

### Debug print issues

1. Compare **`/print/:id` only** to the PDF (not the scaled gallery card on `/p/:id`).
2. Browser zoom **100%**; OS print dialog margins can lie — trust Playwright PDF.
3. If export fails on overflow: open `/print/<id>?density=compact` and check whether body uses `text-print-body-sm`, list `gap-mm-2`, tighter chips.
4. Inspect `output/failures/<id>.png` for the clipped frame Playwright saw.
5. Confirm fonts loaded (Noto Sans SC subset under `public/fonts/`); export waits on `document.fonts.ready` (10s timeout).
6. MediaBox must be **210×297 mm** (±**0.15 mm**). Playwright’s A4 is often ~209.89×297.01 mm (~0.11 mm width delta), so a 0.1 mm gate would reject every happy-path export. If MediaBox fails, check `page.pdf` options vs CSS `@page` / `.a4-page`.
7. Soft grays / accent: Chromium needs `printBackground: true` (set by CLI) and `print-color-adjust: exact` in CSS.
8. Footer has **no ellipsis** — long contact/CTA lines wrap; vertical clip fails the overflow gate. Keep footer copy short enough for the 16 mm band.

### Compact density (author guide)

Set `layout.density: "compact"` in product JSON, or let export promote via `?density=compact` after a failed normal measure. Compact applies:

- hero tagline → `body-sm` + tighter category/name/tagline stack
- body copy → `text-print-body-sm`
- list / intro stack margins → `mt-mm-2` (vs `mt-mm-4`)
- list item row gaps → `gap-mm-2` (or tighter on highlights)
- chips → shorter min-height / tighter padding and wrap gaps
- SoftPanel → `p-mm-4` instead of `p-mm-8`
- section stack gaps slightly reduced (`gap-mm-4` / `mt-mm-6`)

**Author tips to stay on one A4:**

1. Keep Chinese copy concise; long lists are the main overflow risk.
2. Keep deliverables ≤4 and requirements ≤5 when details are on.
3. Omit `item.detail` unless essential; details use meta type but still cost height.
4. Drop `highlights` / set `showHighlights: false` before cutting core lists.
5. Set `layout.density: "compact"` proactively for dense products.
6. Preview `/print/<id>?density=compact` before export; do not rely on silent clip.
7. Compact still fails if content is too long — shorten copy or drop optional blocks.

### Layout variant (`stack` | `split`)

Default is **`split`**: 服务内容 (left) | 客户需具备 SoftPanel (right), fixed 5/7 print grid — **no viewport breakpoints**. Opt out with:

```json
"layout": { "variant": "stack" }
```

Split math (content width **182 mm**, gutter **4 mm**, 12 columns). **TargetCustomer stays full-width** above the row; only Deliverables | Requirements split:

| Zone | Span | Width |
|------|------|--------|
| Deliverables | `col-span-5` | **73.5 mm** |
| Requirements | `col-span-7` | **104.5 mm** |

`col = (182 − 11×4) / 12 = 11.5 mm` → 5-col = 5×11.5 + 4×4 = 73.5; 7-col = 7×11.5 + 6×4 = 104.5.

**Author guidance (split):**

- Prefer shorter **deliverable** labels (~**22 CN** / short EN per line at body size). Zod still allows up to 32 zh / 48 en, but long lines wrap and grow height — overflow risk is higher than stack.
- Keep SoftPanel on **requirements** (default, wider 7-col). Avoid `softPanelOn: "deliverables"` in split: `p-mm-8` eats ~16 mm horizontal inside 73.5 mm (~57.5 mm left for bilingual lists). If you must, use `density: "compact"` (SoftPanel `p-mm-4`).
- Long lists: set `density: "compact"` or trim items before export.

Grid columns stretch equally tall by default (SoftPanel fills the taller column) — intentional for print balance.

### Brand assets

**Current repo art is intentional placeholders** (professional stand-ins, not final brand). Real logo/QR land by replacing files + paths below — no schema change.

Static files are served from **`public/brand/`**:

| File | Role |
|------|------|
| `public/brand/logo.svg` | **Rizo** brand logo (from `rizologo.svg`). Header caps: max **12 mm** tall / **72 mm** wide (`object-contain`). Also mirrored as `public/brand/rizologo.svg`. Product content is **Chinese-only** plain strings (no `en` fields). |
| `public/brand/wechat-qr.svg` | Placeholder QR for demos (**not scannable**). **Replace with real WeChat QR** (PNG or SVG). Footer shows **14 mm**. |

Wire paths in content (not by renaming only):

1. Drop real art into `public/brand/` (keep or change filenames).
2. Set `logoSrc` / `qrSrc` in **`content/brand/default.json`** (shared defaults).
3. Optionally override per product under `brand` in `content/products/<id>.json`.

Accent color defaults to `#0071E3` (`brand.accentColor`) until brand confirms. Company name, CTA, WeChat id, and contact line are content fields — not baked into the SVG.

## Project layout

```text
├── DESIGN.md                 # Full design document
├── package.json
├── bun.lock
├── playwright.config.ts      # webServer → vite preview :4173
├── tsconfig.json
├── tsconfig.node.json        # Vite / scripts / Playwright TS config
├── vite.config.ts
├── tailwind.config.ts        # Frozen color / type / mm-* tokens
├── postcss.config.js
├── index.html
├── content/
│   ├── brand/default.json
│   └── products/             # service one-pager JSON (gaokao-*, example-*)
├── e2e/                      # Playwright screenshot smoke
├── fonts/
│   ├── README.md             # OFL license + re-subset docs
│   ├── charset/              # GB2312-plus inventory for pyftsubset
│   └── subset/               # Committed Noto SC WOFF2 (400/500/700)
├── public/
│   ├── brand/
│   └── fonts/                # Vite-served copies of subset WOFF2
├── scripts/
│   ├── check-print-classes.sh
│   ├── fonts-subset.sh
│   ├── validate-content.mjs
│   ├── export-pdf.ts         # bun run export:pdf
│   └── export-all.ts         # bun run export:all
├── output/                   # gitignored PDFs + failures/ + smoke/
├── src/
│   ├── main.tsx
│   ├── App.tsx               # gallery / preview / print routes
│   ├── index.css
│   ├── export/pdf.ts         # shared export constants + measure helper
│   ├── content/              # Zod schema + loader
│   ├── components/           # A4Page, BiText, Chip, …
│   ├── templates/a4-service-onepager/
│   └── design-tokens/
│       ├── fonts.css
│       └── print.css
└── README.md
```

## License

Private / internal use.
