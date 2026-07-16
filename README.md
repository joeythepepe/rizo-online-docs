# A4 Print Template System

Premium A4 print templates for China-mainland education consulting materials (full bilingual CN+EN). Built with **Vite + React + TypeScript + Tailwind CSS**.

See [DESIGN.md](./DESIGN.md) for the full design specification.

## Quick start

```bash
pnpm install
pnpm dev
```

- **Dev server:** Vite on the default port (usually `http://localhost:5173`)
- **Typecheck:** `pnpm typecheck`
- **Print class denylist:** `pnpm check:print-classes`
- **Font subset (Noto SC):** `pnpm fonts:subset` — see [fonts/README.md](./fonts/README.md)
- **Production build:** `pnpm build`
- **Preview build:** `pnpm preview`

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

**Enforcement (lightweight):** `pnpm check:print-classes` runs `scripts/check-print-classes.sh`, which greps `src/templates/**` and `src/components/**` for breakpoints, `font-semibold`, shadows/rings/gradients/blur, and `min-h-screen` / `h-screen` / `vh`. (Dirs may be empty until later PRs; the script still exits 0.)

## Project layout

```text
├── DESIGN.md                 # Full design document
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.node.json        # Vite / Tailwind tooling TS config
├── vite.config.ts
├── tailwind.config.ts        # Frozen color / type / mm-* tokens
├── postcss.config.js
├── index.html
├── fonts/
│   ├── README.md             # OFL license + re-subset docs
│   ├── charset/              # GB2312-plus inventory for pyftsubset
│   └── subset/               # Committed Noto SC WOFF2 (400/500/700)
├── public/
│   └── fonts/                # Vite-served copies of subset WOFF2
├── scripts/
│   ├── check-print-classes.sh
│   └── fonts-subset.sh       # pnpm fonts:subset
├── src/
│   ├── main.tsx
│   ├── App.tsx               # A4Page + token/font smoke demo
│   ├── index.css             # Tailwind layers
│   ├── vite-env.d.ts
│   ├── components/
│   │   └── A4Page.tsx        # 210×297 + 14 mm safe area shell
│   └── design-tokens/
│       ├── fonts.css         # @font-face Noto Sans SC
│       └── print.css         # @page A4 + .a4-page shell
└── README.md
```

Later PRs add content schema, templates, routes, and PDF export.

## License

Private / internal use.
