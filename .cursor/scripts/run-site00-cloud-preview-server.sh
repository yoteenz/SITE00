#!/usr/bin/env bash
# site00.fsbw-dev.com → localhost:5174
# Default: exact CI production dist (same bytes as GoDaddy after deploy_frontend).
# Override: SITE00_CLOUD_PREVIEW_MODE=dev (HMR) | local (npm run build on VM).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

MODE="${SITE00_CLOUD_PREVIEW_MODE:-ci}"
SYNC="${SITE00_PREVIEW_SYNC_MAIN:-1}"
PORT="${SITE00_CLOUD_PREVIEW_PORT:-5174}"
DIST_DIR="${SITE00_CI_DIST_DIR:-/tmp/site00-cloud-preview-dist}"
LOG="/tmp/site00-cloud-preview-server.log"

log() {
  echo "[$(date -u +%H:%M:%S)] $*" | tee -a "$LOG"
}

if [[ "$MODE" == "dev" ]]; then
  log "Starting Vite DEV on :$PORT (SITE00_CLOUD_PREVIEW_MODE=dev)"
  exec env SITE00_CLOUD_MOBILE_PREVIEW=1 SITE00_CLIENT_REVIEW_PREVIEW_MODE=1 \
    npm run dev -- --port "$PORT" --host
fi

if [[ "$SYNC" == "1" ]]; then
  log "Fetching origin/main…"
  git fetch origin main 2>>"$LOG" || true
  git merge --ff-only origin/main 2>>"$LOG" || log "ff-only merge skipped (dirty tree or diverged)"
fi

HEAD_SHA="$(git rev-parse HEAD 2>/dev/null | cut -c1-12 || echo unknown)"
NEED_CI=1
if [[ -f "$DIST_DIR/release-manifest.json" && -f "$DIST_DIR/index.html" ]]; then
  CACHED_SHA="$(node -e "const m=require('$DIST_DIR/release-manifest.json'); process.stdout.write(m.commitSha||'')" 2>/dev/null || true)"
  if [[ "$CACHED_SHA" == "$HEAD_SHA" ]]; then
    NEED_CI=0
  fi
fi

if [[ "$MODE" == "local" ]]; then
  if [[ ! -f "$ROOT/dist/index.html" ]] || [[ "$(node -e "try{const m=require('$ROOT/dist/release-manifest.json');process.stdout.write(m.commitSha||'')}catch{process.stdout.write('')}" 2>/dev/null)" != "$HEAD_SHA" ]]; then
    log "Local production build for HEAD $HEAD_SHA (GITHUB_SHA=$HEAD_SHA)…"
    env GITHUB_SHA="$(git rev-parse HEAD)" npm run build >>"$LOG" 2>&1
  fi
  DIST_DIR="$ROOT/dist"
elif [[ "$NEED_CI" == "1" ]]; then
  bash "$ROOT/.cursor/scripts/download-site00-ci-production-dist.sh"
fi

if [[ ! -f "$DIST_DIR/index.html" ]]; then
  log "FATAL: no dist at $DIST_DIR"
  exit 1
fi

MANIFEST="$DIST_DIR/release-manifest.json"
if [[ -f "$MANIFEST" ]]; then
  log "Serving: $(node -e "const m=require('$MANIFEST'); console.log(m.releaseId, m.bundleEntry, 'builtAt='+m.builtAt)")"
fi

# vite preview always reads ./dist from repo root
rm -rf "$ROOT/dist"
cp -a "$DIST_DIR/." "$ROOT/dist/"

log "Starting vite preview on :$PORT (dist synced from $DIST_DIR)"
exec npx vite preview --port "$PORT" --host --strictPort
