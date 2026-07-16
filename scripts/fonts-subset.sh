#!/usr/bin/env bash
# Subset Noto Sans SC (400/500/700) → WOFF2 for print embed.
# Usage: pnpm fonts:subset  |  bash scripts/fonts-subset.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RAW_DIR="${ROOT}/fonts/raw"
SUBSET_DIR="${ROOT}/fonts/subset"
PUBLIC_DIR="${ROOT}/public/fonts"
CHARSET="${ROOT}/fonts/charset/gb2312-plus.txt"
MAX_TOTAL_BYTES=$((6 * 1024 * 1024)) # 6 MB hard cap
TARGET_TOTAL_BYTES=$((4 * 1024 * 1024)) # 4 MB soft target

# Pin upstream Noto CJK Sans release (reproducible re-subsets).
# Tag: Sans2.004 — https://github.com/notofonts/noto-cjk/releases/tag/Sans2.004
# Commit: 523d033d6cb47f4a80c58a35753646f5c3608a78
NOTO_CJK_REF="Sans2.004"
NOTO_CJK_SHA="523d033d6cb47f4a80c58a35753646f5c3608a78"
MIN_RAW_BYTES=$((1 * 1024 * 1024)) # reject downloads under 1 MB

# Weight map: CSS weight → face name (no 600 / SemiBold)
declare -a FACES=("Regular" "Medium" "Bold")
declare -a WEIGHTS=("400" "500" "700")

# Prefer pyftsubset on PATH, then user install globs, then python -m
resolve_pyftsubset() {
  if command -v pyftsubset >/dev/null 2>&1; then
    echo "pyftsubset"
    return 0
  fi
  local cand
  # macOS pip --user layouts (any Python minor: 3.9, 3.13, …)
  if [[ -d "${HOME}/Library/Python" ]]; then
    # shellcheck disable=SC2044
    for cand in $(find "${HOME}/Library/Python" -path '*/bin/pyftsubset' -type f 2>/dev/null | sort -r); do
      if [[ -x "$cand" ]]; then
        echo "$cand"
        return 0
      fi
    done
  fi
  for cand in \
    "${HOME}/.local/bin/pyftsubset" \
    "${HOME}/.pyenv/shims/pyftsubset"; do
    if [[ -x "$cand" ]]; then
      echo "$cand"
      return 0
    fi
  done
  if python3 -c "from fontTools.subset import main" >/dev/null 2>&1; then
    echo "python3 -m fontTools.subset"
    return 0
  fi
  return 1
}

if ! PYFTSUBSET_CMD="$(resolve_pyftsubset)"; then
  cat >&2 <<'EOF'
error: pyftsubset (fonttools) not found.

Install:
  pip3 install --user 'fonttools[woff]' brotli

Then re-run: pnpm fonts:subset
EOF
  exit 1
fi
echo "==> Using pyftsubset: ${PYFTSUBSET_CMD}"

# shellcheck disable=SC2206
PYFTSUBSET=( $PYFTSUBSET_CMD )

if [[ ! -f "$CHARSET" ]]; then
  echo "error: charset missing: $CHARSET" >&2
  exit 1
fi

mkdir -p "$RAW_DIR" "$SUBSET_DIR" "$PUBLIC_DIR"

# Static OFL Noto Sans SC (region SubsetOTF — Simplified Chinese)
# Source: https://github.com/notofonts/noto-cjk (SIL Open Font License 1.1)
# Pinned to tag ${NOTO_CJK_REF} (${NOTO_CJK_SHA}) — not floating main.
BASE_URLS=(
  "https://raw.githubusercontent.com/notofonts/noto-cjk/${NOTO_CJK_REF}/Sans/SubsetOTF/SC"
  "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@${NOTO_CJK_REF}/Sans/SubsetOTF/SC"
  "https://github.com/notofonts/noto-cjk/raw/${NOTO_CJK_REF}/Sans/SubsetOTF/SC"
)

# OTF = 'OTTO' (CFF), TTF/OTF TrueType sfnt = 0x00010000
validate_raw_face() {
  local file="$1"
  local sz magic
  sz=$(wc -c <"$file" | tr -d ' ')
  if (( sz < MIN_RAW_BYTES )); then
    echo "error: $(basename "$file") too small (${sz} bytes; need ≥ ${MIN_RAW_BYTES})" >&2
    return 1
  fi
  magic=$(head -c 4 "$file" | od -An -tx1 | tr -d ' \n')
  # OTTO (CFF OpenType) or 00 01 00 00 (TrueType sfnt)
  if [[ "$magic" != "4f54544f" && "$magic" != "00010000" ]]; then
    echo "error: $(basename "$file") is not a plausible OpenType font (magic=${magic})" >&2
    return 1
  fi
  return 0
}

download_face() {
  local face="$1"
  local out="${RAW_DIR}/NotoSansSC-${face}.otf"
  if [[ -f "$out" && -s "$out" ]]; then
    if validate_raw_face "$out"; then
      echo "  raw present: $(basename "$out") ($(wc -c <"$out" | tr -d ' ') bytes)"
      return 0
    fi
    echo "  raw invalid; re-downloading $(basename "$out")"
    rm -f "$out"
  fi
  local url base
  for base in "${BASE_URLS[@]}"; do
    url="${base}/NotoSansSC-${face}.otf"
    echo "  downloading ${face} from ${url}"
    if curl -fsSL --retry 3 --retry-delay 2 -o "${out}.partial" "$url"; then
      if validate_raw_face "${out}.partial"; then
        mv "${out}.partial" "$out"
        echo "  saved $(basename "$out") ($(wc -c <"$out" | tr -d ' ') bytes)"
        return 0
      fi
      rm -f "${out}.partial"
      echo "  reject: invalid payload from ${url}" >&2
      continue
    fi
    rm -f "${out}.partial"
  done
  echo "error: failed to download NotoSansSC-${face}.otf (pin ${NOTO_CJK_REF})" >&2
  return 1
}

echo "==> Downloading raw Noto Sans SC faces (OFL, pin ${NOTO_CJK_REF} / ${NOTO_CJK_SHA}) if needed"
for face in "${FACES[@]}"; do
  download_face "$face"
done

# Print-oriented layout features only (horizontal CJK + basic Latin).
# Avoid --layout-features='*', --glyph-names; use --desubroutinize + --no-hinting
# so full GB2312×3 stays under the 4 MB soft target for web/PDF embed.
LAYOUT_FEATURES="ccmp,locl,kern,liga,calt,mark,mkmk"

echo "==> Subsetting with charset $(basename "$CHARSET") → WOFF2"
echo "    layout-features=${LAYOUT_FEATURES}; desubroutinize; no-hinting; no glyph-names"
for i in "${!FACES[@]}"; do
  face="${FACES[$i]}"
  weight="${WEIGHTS[$i]}"
  src="${RAW_DIR}/NotoSansSC-${face}.otf"
  dest="${SUBSET_DIR}/NotoSansSC-${face}.woff2"
  if [[ ! -f "$src" ]]; then
    echo "error: missing source $src" >&2
    exit 1
  fi
  echo "  ${face} (CSS ${weight}) → $(basename "$dest")"
  "${PYFTSUBSET[@]}" \
    "$src" \
    --text-file="$CHARSET" \
    --flavor=woff2 \
    --layout-features="${LAYOUT_FEATURES}" \
    --desubroutinize \
    --no-hinting \
    --symbol-cmap \
    --legacy-cmap \
    --notdef-glyph \
    --notdef-outline \
    --recommended-glyphs \
    --name-legacy \
    --drop-tables+=DSIG \
    --output-file="$dest"
done

echo "==> Copying subsets → public/fonts/"
for face in "${FACES[@]}"; do
  cp -f "${SUBSET_DIR}/NotoSansSC-${face}.woff2" "${PUBLIC_DIR}/NotoSansSC-${face}.woff2"
done

echo "==> Size check"
total=0
mb() { awk -v b="$1" 'BEGIN { printf "%.2f", b/1048576 }'; }
for face in "${FACES[@]}"; do
  f="${SUBSET_DIR}/NotoSansSC-${face}.woff2"
  sz=$(wc -c <"$f" | tr -d ' ')
  total=$((total + sz))
  printf "  %-28s %8d bytes (%s MB)\n" "$(basename "$f")" "$sz" "$(mb "$sz")"
done
printf "  %-28s %8d bytes (%s MB)\n" "TOTAL" "$total" "$(mb "$total")"

if (( total > MAX_TOTAL_BYTES )); then
  echo "error: total subset size ${total} exceeds hard cap ${MAX_TOTAL_BYTES} (6 MB)" >&2
  exit 1
fi
if (( total > TARGET_TOTAL_BYTES )); then
  echo "warn: total ${total} exceeds soft target 4 MB (still under 6 MB hard cap)" >&2
else
  echo "    soft target ≤ 4 MB: ok"
fi

echo "==> Done. Subsets in fonts/subset/ and public/fonts/"
echo "    Upstream pin: notofonts/noto-cjk@${NOTO_CJK_REF} (${NOTO_CJK_SHA})"
echo "    Re-run after charset changes: pnpm fonts:subset"
