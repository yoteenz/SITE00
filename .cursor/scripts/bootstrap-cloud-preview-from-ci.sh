#!/usr/bin/env bash
# Runs on every cloud environment start — sync preview dist to latest CI deploy on origin/main.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG="/tmp/site00-cloud-preview-bootstrap.log"

{
  echo "[$(date -u +%H:%M:%S)] bootstrap-cloud-preview-from-ci"
  cd "$ROOT"
  git fetch origin main 2>&1 || true
  export SITE00_PREVIEW_MATCH_REF=origin/main
  HEAD_SHA="$(git rev-parse HEAD 2>/dev/null | cut -c1-12 || echo unknown)"
  bash "$ROOT/.cursor/scripts/download-site00-ci-production-dist.sh"
  CI_SHA="$(node -e "const m=require('/tmp/site00-cloud-preview-dist/release-manifest.json'); process.stdout.write(m.commitSha||'')" 2>/dev/null || true)"
  if [[ -n "$CI_SHA" && "$CI_SHA" != "$HEAD_SHA" ]]; then
    echo "[$(date -u +%H:%M:%S)] CI dist ($CI_SHA) behind HEAD $HEAD_SHA — local preview build"
    env GITHUB_SHA="$(git rev-parse HEAD)" npm run build >>"$LOG" 2>&1
  else
    rm -rf "$ROOT/dist"
    mkdir -p "$ROOT/dist"
    cp -a /tmp/site00-cloud-preview-dist/. "$ROOT/dist/"
    echo "[$(date -u +%H:%M:%S)] dist synced from CI for preview"
  fi
} >>"$LOG" 2>&1
