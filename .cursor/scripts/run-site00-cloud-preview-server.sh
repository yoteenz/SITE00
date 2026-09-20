#!/usr/bin/env bash
# site00.fsbw-dev.com → localhost:5174
# Default: production dist (vite preview) synced to origin/main — matches GoDaddy bundle, not stale Vite dev.
# Override: SITE00_CLOUD_PREVIEW_MODE=dev for HMR while coding.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

MODE="${SITE00_CLOUD_PREVIEW_MODE:-production}"
SYNC="${SITE00_PREVIEW_SYNC_MAIN:-1}"
PORT="${SITE00_CLOUD_PREVIEW_PORT:-5174}"
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
  log "Fetching origin/main for preview parity…"
  git fetch origin main 2>>"$LOG" || true
  if git rev-parse origin/main >/dev/null 2>&1; then
    git merge --ff-only origin/main 2>>"$LOG" || log "ff-only merge skipped (dirty tree or diverged)"
  fi
fi

HEAD_SHA="$(git rev-parse HEAD 2>/dev/null | cut -c1-12 || echo unknown)"
MANIFEST="$ROOT/dist/release-manifest.json"
NEED_BUILD=1
if [[ -f "$MANIFEST" ]]; then
  BUILT_SHA="$(node -e "const m=require('$MANIFEST'); process.stdout.write(m.commitSha||'')" 2>/dev/null || true)"
  if [[ "$BUILT_SHA" == "$HEAD_SHA" && -f "$ROOT/dist/index.html" ]]; then
    NEED_BUILD=0
  fi
fi

if [[ "$NEED_BUILD" == "1" ]]; then
  log "Building production dist for preview (HEAD $HEAD_SHA)…"
  npm run build >>"$LOG" 2>&1
else
  log "Reusing dist for HEAD $HEAD_SHA"
fi

if [[ -f "$MANIFEST" ]]; then
  log "Preview bundle: $(node -e "const m=require('$MANIFEST'); console.log(m.releaseId, m.bundleEntry)")"
fi

log "Starting vite preview on :$PORT (production parity)"
exec npx vite preview --port "$PORT" --host --strictPort
