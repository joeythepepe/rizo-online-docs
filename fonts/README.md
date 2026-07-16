# Fonts — Noto Sans SC (print embed)

## License

**Noto Sans SC** is part of the [Noto CJK](https://github.com/notofonts/noto-cjk) family and is licensed under the **SIL Open Font License 1.1 (OFL-1.1)**.

- Upstream: https://github.com/notofonts/noto-cjk  
- Specimen: https://fonts.google.com/noto/specimen/Noto+Sans+SC  
- OFL text: https://openfontlicense.org/

You may embed, subset, and redistribute these fonts under the OFL. Do not sell the fonts alone.

Raw full faces are **not** committed (`fonts/raw/` is gitignored). Only **subset WOFF2** files under `fonts/subset/` and `public/fonts/` are shipped.

## Upstream pin (reproducible downloads)

Raw OFTs are fetched from a **fixed release tag**, not floating `main`:

| Field | Value |
|-------|--------|
| Repo | `notofonts/noto-cjk` |
| Tag | **`Sans2.004`** |
| Commit | `523d033d6cb47f4a80c58a35753646f5c3608a78` |
| Path | `Sans/SubsetOTF/SC/NotoSansSC-{Regular,Medium,Bold}.otf` |
| Release | https://github.com/notofonts/noto-cjk/releases/tag/Sans2.004 |

`scripts/fonts-subset.sh` sets `NOTO_CJK_REF` / `NOTO_CJK_SHA`. Bump both together when intentionally upgrading.

## Shipped weights (CSS mapping)

| CSS `font-weight` | Face file | Use |
|-------------------|-----------|-----|
| **400** | `NotoSansSC-Regular.woff2` | Body, meta, EN |
| **500** | `NotoSansSC-Medium.woff2` | Labels / eyebrows |
| **700** | `NotoSansSC-Bold.woff2` | Display + section titles |

**No 600 / SemiBold.** Never use `font-semibold` or `font-weight: 600` — there is no matching face; browsers would faux-bold and PDF export would look wrong.

## Layout on disk

```text
fonts/
├── README.md                 # this file
├── charset/
│   └── gb2312-plus.txt       # subset character inventory
├── raw/                      # full OFL OTF (gitignored; downloaded by script)
│   └── NotoSansSC-{Regular,Medium,Bold}.otf
└── subset/                   # committed WOFF2 subsets
    └── NotoSansSC-{Regular,Medium,Bold}.woff2

public/fonts/                 # Vite-served copy (same WOFF2 files)
└── NotoSansSC-{Regular,Medium,Bold}.woff2
```

`@font-face` rules live in `src/design-tokens/fonts.css` (`font-display: block` for export reliability).

## Charset

`fonts/charset/gb2312-plus.txt` includes:

- ASCII printable (Latin letters, digits, basic punctuation)
- Full-width digits / Latin / CN punctuation common in print UI
- Common symbols (© · — – … € £ ¥, etc.)
- Full **GB2312** CJK repertoire (常用 + 次常用)

Enough for bilingual education-consulting one-pagers without shipping the entire CJK font.

## Re-subset (regenerate WOFF2)

Requirements:

- `curl`
- Python 3 + **fonttools** with WOFF2:  
  `pip3 install --user 'fonttools[woff]' brotli`
- `pyftsubset` on `PATH`, under `~/Library/Python/*/bin`, `~/.local/bin`, or via `python3 -m fontTools.subset` (the script globs these and logs which resolver won)

Then:

```bash
pnpm fonts:subset
# equivalent: bash scripts/fonts-subset.sh
```

The script will:

1. Download raw `NotoSansSC-{Regular,Medium,Bold}.otf` into `fonts/raw/` if missing (pinned `Sans2.004` SubsetOTF/SC; validates ≥ 1 MB + OTF magic).
2. Run `pyftsubset` with `--text-file=fonts/charset/gb2312-plus.txt` → WOFF2.
   - Layout features: `ccmp,locl,kern,liga,calt,mark,mkmk` (not `*`)
   - `--desubroutinize` + `--no-hinting` for compact print embed
   - No `--glyph-names`
3. Copy subsets to `public/fonts/`.
4. Fail if total subset size **> 6 MB** (soft target **≤ 4 MB**).

After changing the charset, re-run the script and commit the updated files under `fonts/subset/` and `public/fonts/`.

## Size budget

| Cap | Value |
|-----|-------|
| Soft target | ≤ 4 MB total (all three weights) |
| Hard fail | ≤ 6 MB total |

### Measured committed subsets (post subset pipeline)

| Face | Approx. size |
|------|----------------|
| Regular (400) | ~1.04 MB |
| Medium (500) | ~1.05 MB |
| Bold (700) | ~1.06 MB |
| **Total** | **~3.15 MB** (under soft target) |

Re-check after re-subset:

```bash
du -ch fonts/subset/*.woff2 | tail -1
```
