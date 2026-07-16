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

# Weight map: CSS weight → face name (no 600 / SemiBold)
declare -a FACES=("Regular" "Medium" "Bold")
declare -a WEIGHTS=("400" "500" "700")

# Prefer pyftsubset on PATH, then common user install locations, then python -m
resolve_pyftsubset() {
  if command -v pyftsubset >/dev/null 2>&1; then
    echo "pyftsubset"
    return 0
  fi
  local cand
  for cand in \
    "${HOME}/Library/Python/3.9/bin/pyftsubset" \
    "${HOME}/Library/Python/3.10/bin/pyftsubset" \
    "${HOME}/Library/Python/3.11/bin/pyftsubset" \
    "${HOME}/Library/Python/3.12/bin/pyftsubset" \
    "${HOME}/.local/bin/pyftsubset"; do
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

# shellcheck disable=SC2206
PYFTSUBSET=( $PYFTSUBSET_CMD )

if [[ ! -f "$CHARSET" ]]; then
  echo "error: charset missing: $CHARSET" >&2
  exit 1
fi

mkdir -p "$RAW_DIR" "$SUBSET_DIR" "$PUBLIC_DIR"

# Static OFL Noto Sans SC (region SubsetOTF — Simplified Chinese)
# Source: https://github.com/notofonts/noto-cjk (SIL Open Font License 1.1)
BASE_URLS=(
  "https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/SubsetOTF/SC"
  "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/SC"
  "https://github.com/notofonts/noto-cjk/raw/main/Sans/SubsetOTF/SC"
)

download_face() {
  local face="$1"
  local out="${RAW_DIR}/NotoSansSC-${face}.otf"
  if [[ -f "$out" && -s "$out" ]]; then
    echo "  raw present: $(basename "$out") ($(wc -c <"$out") bytes)"
    return 0
  fi
  local url base
  for base in "${BASE_URLS[@]}"; do
    url="${base}/NotoSansSC-${face}.otf"
    echo "  downloading ${face} from ${url}"
    if curl -fsSL --retry 3 --retry-delay 2 -o "${out}.partial" "$url"; then
      mv "${out}.partial" "$out"
      echo "  saved $(basename "$out") ($(wc -c <"$out") bytes)"
      return 0
    fi
    rm -f "${out}.partial"
  done
  echo "error: failed to download NotoSansSC-${face}.otf" >&2
  return 1
}

echo "==> Downloading raw Noto Sans SC faces (OFL) if needed"
for face in "${FACES[@]}"; do
  download_face "$face"
done

echo "==> Subsetting with charset $(basename "$CHARSET") → WOFF2"
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
    --layout-features='*' \
    --glyph-names \
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
fi

echo "==> Done. Subsets in fonts/subset/ and public/fonts/"
echo "    Re-run after charset changes: pnpm fonts:subset"
