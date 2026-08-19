#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

: "${VITE_SUPABASE_URL:?Set VITE_SUPABASE_URL}"
: "${VITE_SUPABASE_ANON_KEY:?Set VITE_SUPABASE_ANON_KEY}"

export VITE_SITE00_ROOT="${VITE_SITE00_ROOT:-1}"
export VITE_SITE00_CANONICAL_ORIGIN="${VITE_SITE00_CANONICAL_ORIGIN:-https://site00.com}"

npm run build
echo "Built dist/ — upload contents to GoDaddy public_html (see docs/DEPLOYMENT.md)."
