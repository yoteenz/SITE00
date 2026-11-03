#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
STAMP="2026-11-02"
COMPACT="/tmp/jurnl-product-utility-founder-review-${STAMP}.zip"
FULL="/tmp/jurnl-product-utility-evidence-${STAMP}.zip"
WORK="/tmp/jurnl-utility-pack-$$"
rm -rf "$WORK"
mkdir -p "$WORK/compact"

cp "$ROOT/JURNL/MANIFEST/PRODUCT_UTILITY_AUDIT_V1/JURNL_FOUNDER_PRODUCT_UTILITY_REVIEW.md" "$WORK/compact/"
cp "$ROOT/JURNL/MANIFEST/PRODUCT_UTILITY_AUDIT_V1/JURNL_DAILY_FINANCIAL_JOURNEY_AUDIT.md" "$WORK/compact/"
cp "$ROOT/JURNL/MANIFEST/PRODUCT_UTILITY_AUDIT_V1/JURNL_PERSONAL_ACCOUNTING_ASSISTANT_IMPLEMENTATION_ROADMAP.md" "$WORK/compact/"
cp "$ROOT/JURNL/MANIFEST/PRODUCT_UTILITY_AUDIT_V1/JURNL_PLAIN_LANGUAGE_AUDIT.csv" "$WORK/compact/"

(cd "$WORK/compact" && zip -qr "$COMPACT" .)
(
  cd "$ROOT"
  zip -qr "$FULL" JURNL/MANIFEST/PRODUCT_UTILITY_AUDIT_V1 scripts/jurnl/product-utility-audit e2e/jurnl/jurnl-product-utility-journeys.e2e.ts
)
echo "COMPACT_ZIP=$COMPACT"
echo "FULL_ZIP=$FULL"
