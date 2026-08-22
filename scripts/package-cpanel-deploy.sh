#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DATE="$(date -u +%Y-%m-%d)"
ZIP_NAME="site00-production-dist-${DATE}.zip"
OUT="/tmp/${ZIP_NAME}"

npm run build

(
  cd dist
  zip -r "$OUT" .
)

cp SITE00-DEPLOY-README.txt "/tmp/SITE00-DEPLOY-README.txt"

echo "Built: $OUT"
echo "Upload to GoDaddy public_html and extract in place."
echo "Verify index.html does NOT reference index.BT7zuSxb.js"
