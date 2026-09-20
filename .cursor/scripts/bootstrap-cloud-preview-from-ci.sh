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
  bash "$ROOT/.cursor/scripts/download-site00-ci-production-dist.sh"
  rm -rf "$ROOT/dist"
  mkdir -p "$ROOT/dist"
  cp -a /tmp/site00-cloud-preview-dist/. "$ROOT/dist/"
  echo "[$(date -u +%H:%M:%S)] dist synced for preview"
} >>"$LOG" 2>&1
