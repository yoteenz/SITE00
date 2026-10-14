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
OUT="/tmp/site00-founder-staging-dist-$(date +%Y%m%d).zip"
rm -f "$OUT"
(cd dist && zip -qr "$OUT" .)
echo "Wrote $OUT"
echo "STAGING_API_BASE=$STAGING_API_BASE"
echo "STAGING_PUBLIC_ORIGIN=$STAGING_PUBLIC_ORIGIN"
