#!/usr/bin/env bash
# Compact + full evidence ZIPs for founder mobile review (no deploy).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
STAMP="2026-11-02"
COMPACT="/tmp/jurnl-identity-founder-review-v2-${STAMP}.zip"
FULL="/tmp/jurnl-identity-canonical-evidence-v2-${STAMP}.zip"
WORK="/tmp/jurnl-identity-v2-pack-$$"
rm -rf "$WORK"
mkdir -p "$WORK/compact"/{01_f09_lockup,03_v1_layers,05_sprig,06_wordmark,07_v2_composite,08_transparency,09_fidelity,10_docs}

cp "$ROOT/src/projects/jurnl/families/F09_SAFE/ENVIRONMENTS/F09_LOCKUP.png" "$WORK/compact/01_f09_lockup/"
cp "$ROOT/src/projects/jurnl/families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_SPRIG.png" "$WORK/compact/05_sprig/"
cp "$ROOT/src/projects/jurnl/families/F09_SAFE/REFERENCE_REPLICA/assets/LOCKUP_WORD.png" "$WORK/compact/06_wordmark/"
cp "$ROOT/JURNL/MANIFEST/IDENTITY_RECOVERY_V2/assets/LOCKUP_HORIZONTAL.v2_candidate.png" "$WORK/compact/07_v2_composite/"
cp "$ROOT/JURNL/MANIFEST/IDENTITY_RECOVERY_V2/JURNL_CANONICAL_IDENTITY_TRANSPARENCY_QA.jpg" "$WORK/compact/08_transparency/"
cp "$ROOT/JURNL/MANIFEST/IDENTITY_RECOVERY_V2/JURNL_CANONICAL_IDENTITY_FIDELITY_BOARD.jpg" "$WORK/compact/09_fidelity/"
cp "$ROOT/JURNL/MANIFEST/IDENTITY_RECOVERY_V1/JURNL_CANONICAL_IDENTITY_COMPARISON_BOARD.jpg" "$WORK/compact/03_v1_layers/"
cp "$ROOT/JURNL/MANIFEST/IDENTITY_RECOVERY_V2/JURNL_IDENTITY_FOUNDER_REVIEW_V2.md" "$WORK/compact/10_docs/"
cp "$ROOT/JURNL/MANIFEST/IDENTITY_RECOVERY_V2/reports/JURNL_CANONICAL_ASSET_TECHNICAL_REPORT.json" "$WORK/compact/10_docs/"
cp "$ROOT/JURNL/MANIFEST/IDENTITY_RECOVERY_V1/RECOVERED_IDENTITY_REGISTRY.json" "$WORK/compact/10_docs/"

(cd "$WORK/compact" && zip -qr "$COMPACT" .)

(
  cd "$ROOT"
  zip -qr "$FULL" \
    JURNL/MANIFEST/IDENTITY_RECOVERY_V2 \
    JURNL/MANIFEST/IDENTITY_RECOVERY_V1 \
    JURNL/MANIFEST/REFERENCE_HYGIENE_V1/IDENTITY_REFERENCE_PACK.json \
    JURNL/MANIFEST/REFERENCE_HYGIENE_V1/JURNL_REFERENCE_MANIFEST_V1.json \
    scripts/jurnl/identity-recovery \
    tests/jurnlIdentityRecovery1.test.ts \
    tests/jurnlIdentityRecoveryV2.test.ts
)

echo "COMPACT_ZIP=$COMPACT"
echo "FULL_ZIP=$FULL"
