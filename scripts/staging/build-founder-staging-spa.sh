#!/usr/bin/env bash
# Build SPA for Digital Foundation founder staging (NOT site00.com production).
# Requires STAGING_API_BASE and STAGING_PUBLIC_ORIGIN (https URLs, no secrets).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

: "${STAGING_API_BASE:?Set STAGING_API_BASE e.g. https://site00-api-staging.up.railway.app}"
: "${STAGING_PUBLIC_ORIGIN:?Set STAGING_PUBLIC_ORIGIN e.g. https://staging.site00.com or Railway static URL}"

export VITE_API_BASE="$STAGING_API_BASE"
export VITE_SITE00_PUBLIC_ORIGIN="$STAGING_PUBLIC_ORIGIN"
export VITE_SITE00_ROOT=1

npm run build
OUT="/tmp/site00-founder-staging-dist-$(date +%Y%m%d).zip"
rm -f "$OUT"
(cd dist && zip -qr "$OUT" .)
echo "Wrote $OUT"
echo "STAGING_API_BASE=$STAGING_API_BASE"
echo "STAGING_PUBLIC_ORIGIN=$STAGING_PUBLIC_ORIGIN"
