#!/usr/bin/env bash
# EMERGENCY FALLBACK ONLY — normal releases use site00-production-deploy.yml (P0.DEPLOY.1).
# Do not use this as the primary deployment path after P0.DEPLOY.1.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DATE="$(date -u +%Y-%m-%d)"
ZIP_NAME="site00-production-dist-${DATE}-emergency.zip"
OUT="/tmp/${ZIP_NAME}"

npm run build

(
  cd dist
  zip -r "$OUT" .
)

cp SITE00-DEPLOY-README.txt "/tmp/SITE00-DEPLOY-README.txt"

echo "EMERGENCY ZIP (fallback only): $OUT"
echo "Primary path: merge to main → site00-production-deploy.yml"
echo "Manual upload only if pipeline credentials are unavailable."
echo "Verify index.html does NOT reference index.BT7zuSxb.js"
