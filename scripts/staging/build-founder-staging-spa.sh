#!/usr/bin/env bash
# Build SPA for Digital Foundation founder staging (NOT site00.com production).
# Requires STAGING_API_BASE and STAGING_PUBLIC_ORIGIN (https URLs, no secrets).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

: "${STAGING_API_BASE:?Set STAGING_API_BASE e.g. https://reliable-creation-staging.up.railway.app}"
: "${STAGING_PUBLIC_ORIGIN:?Set STAGING_PUBLIC_ORIGIN to the staging SPA public URL (same host you will open in the browser)}"
: "${VITE_SUPABASE_URL:?Set VITE_SUPABASE_URL to site00-staging only (https://soocqbyjkxeubfjnuwvf.supabase.co)}"
: "${VITE_SUPABASE_ANON_KEY:?Set VITE_SUPABASE_ANON_KEY to site00-staging anon key only — never service role}"

export VITE_API_BASE="$STAGING_API_BASE"
export VITE_SITE00_PUBLIC_ORIGIN="$STAGING_PUBLIC_ORIGIN"
export VITE_SITE00_ROOT=1
export VITE_SUPABASE_URL
export VITE_SUPABASE_ANON_KEY

npm run build

if [[ ! -f dist/index.html ]]; then
  echo "ERROR: dist/index.html missing after build" >&2
  exit 1
fi

echo "Build OK: dist/index.html present ($(wc -c < dist/index.html | tr -d ' ') bytes)"

# Railway serves dist/ directly — ZIP is optional (local artifact only).
if [[ "${STAGING_SPA_PACKAGE_ZIP:-0}" == "1" ]]; then
  if command -v zip >/dev/null 2>&1; then
    OUT="/tmp/site00-founder-staging-dist-$(date +%Y%m%d).zip"
    rm -f "$OUT"
    (cd dist && zip -qr "$OUT" .)
    echo "Wrote $OUT"
  else
    echo "WARN: STAGING_SPA_PACKAGE_ZIP=1 but zip(1) not found — skipping archive (build still OK)" >&2
  fi
else
  echo "Skipping ZIP (set STAGING_SPA_PACKAGE_ZIP=1 locally to package dist/)"
fi

echo "STAGING_API_BASE=$STAGING_API_BASE"
echo "STAGING_PUBLIC_ORIGIN=$STAGING_PUBLIC_ORIGIN"
