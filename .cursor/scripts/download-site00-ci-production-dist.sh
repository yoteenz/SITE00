#!/usr/bin/env bash
# Download the same dist/ artifact GitHub Actions deploys to GoDaddy (site00.com).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="${SITE00_CI_DIST_DIR:-/tmp/site00-cloud-preview-dist}"
LOG="/tmp/site00-ci-dist-download.log"
WORKFLOW="${SITE00_PRODUCTION_WORKFLOW:-site00-production-deploy.yml}"
REPO="${GITHUB_REPOSITORY:-yoteenz/SITE00}"

mkdir -p "$OUT_DIR"
cd "$ROOT"

git fetch origin main 2>>"$LOG" || true
MATCH_REF="${SITE00_PREVIEW_MATCH_REF:-origin/main}"
if git rev-parse "$MATCH_REF" >/dev/null 2>&1; then
  HEAD_SHA="$(git rev-parse "$MATCH_REF")"
else
  HEAD_SHA="$(git rev-parse HEAD 2>/dev/null || echo unknown)"
fi
SHORT="${HEAD_SHA:0:12}"

log() {
  echo "[$(date -u +%H:%M:%S)] $*" | tee -a "$LOG"
}

if ! command -v gh >/dev/null 2>&1; then
  log "gh CLI missing — cannot download CI dist"
  exit 1
fi

RUN_ID="$(
  gh run list \
    --repo "$REPO" \
    --workflow="$WORKFLOW" \
    --branch=main \
    --status=success \
    --limit=40 \
    --json databaseId,headSha \
    -q ".[] | select(.headSha==\"$HEAD_SHA\") | .databaseId" 2>>"$LOG" | head -1
)"

if [[ -z "$RUN_ID" ]]; then
  RUN_ID="$(
    gh run list \
      --repo "$REPO" \
      --workflow="$WORKFLOW" \
      --branch=main \
      --status=success \
      --limit=1 \
      --json databaseId,headSha \
      -q '.[0].databaseId' 2>>"$LOG"
  )"
  log "No CI run for HEAD $HEAD_SHA — using latest successful main run $RUN_ID"
else
  log "CI run $RUN_ID matches HEAD $HEAD_SHA"
fi

if [[ -z "$RUN_ID" || "$RUN_ID" == "null" ]]; then
  log "No successful production workflow run found"
  exit 1
fi

STAGE="/tmp/site00-cloud-preview-dist-staging"
rm -rf "$STAGE"
mkdir -p "$STAGE"

log "Downloading artifact site00-production-dist from run $RUN_ID…"
gh run download "$RUN_ID" -n site00-production-dist -D "$STAGE" --repo "$REPO" >>"$LOG" 2>&1

if [[ ! -f "$STAGE/index.html" || ! -f "$STAGE/release-manifest.json" ]]; then
  log "Download incomplete — missing index.html or release-manifest.json"
  exit 1
fi

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
shopt -s dotglob nullglob
mv "$STAGE"/* "$OUT_DIR/"
rmdir "$STAGE" 2>/dev/null || true

COMMIT="$(node -e "const m=require('$OUT_DIR/release-manifest.json'); console.log(m.commitSha||'')")"
BUNDLE="$(node -e "const m=require('$OUT_DIR/release-manifest.json'); console.log(m.bundleEntry||'')")"
log "CI dist ready: commitSha=$COMMIT bundleEntry=$BUNDLE → $OUT_DIR"
