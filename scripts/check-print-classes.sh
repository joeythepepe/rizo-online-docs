#!/usr/bin/env bash
# Lightweight denylist for print templates / print shell components.
# Screen-only chrome (gallery / preview / UI icons) is out of scope — see README.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Paths that must stay print-safe.
SCAN_GLOBS=(
  "src/templates"
  "src/components"
)

# Screen chrome under components/ — shadows, semibold, breakpoints allowed here.
EXCLUDE_ERE='src/components/(gallery|preview|ui)/'

# Patterns forbidden in print template / shell source (ERE).
# - breakpoints, shadows, rings, gradients, blur
# - font-semibold (600) — no SemiBold face
# - min-h-screen / h-screen / vh page heights
FORBIDDEN_ERE='(sm:|md:|lg:|xl:|2xl:|font-semibold|shadow-|ring-|bg-gradient-|blur-|min-h-screen|h-screen|[0-9]+vh)'

# Download button is gallery-only chrome (never on /print roots).
ALLOWLIST_FILES=(
  "src/components/DownloadPdfButton.tsx"
)

is_allowlisted() {
  local f="$1"
  for a in "${ALLOWLIST_FILES[@]}"; do
    if [[ "$f" == "$a" ]]; then
      return 0
    fi
  done
  return 1
}

found=0
checked_any=0

for dir in "${SCAN_GLOBS[@]}"; do
  if [[ ! -d "$dir" ]]; then
    continue
  fi
  while IFS= read -r -d '' file; do
    if [[ "$file" =~ $EXCLUDE_ERE ]]; then
      continue
    fi
    if is_allowlisted "$file"; then
      continue
    fi
    checked_any=1
    if grep -nE "$FORBIDDEN_ERE" "$file" 2>/dev/null; then
      echo "error: forbidden print utility in $file" >&2
      found=1
    fi
  done < <(find "$dir" -type f \( -name '*.tsx' -o -name '*.ts' -o -name '*.css' -o -name '*.jsx' -o -name '*.js' \) -print0 2>/dev/null)
done

if [[ "$found" -ne 0 ]]; then
  echo "" >&2
  echo "check-print-classes: failed — remove breakpoints, shadows, rings, gradients, blur," >&2
  echo "font-semibold (600), min-h-screen/h-screen/vh from print templates and shell components." >&2
  echo "See README.md § Forbidden utilities." >&2
  exit 1
fi

if [[ "$checked_any" -eq 0 ]]; then
  echo "check-print-classes: ok (no print paths yet — will enforce when added)"
else
  echo "check-print-classes: ok"
fi
