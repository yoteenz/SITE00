#!/usr/bin/env bash
# Isolated SITE 00 general builder preview (PR #1672 worktree) — NOT the foundation tunnel on :5174.
set -euo pipefail

ROOT="${SITE00_BUILDER_PREVIEW_ROOT:-/tmp/site00-builder-preview-bldr1672}"
PORT="${SITE00_BUILDER_PREVIEW_PORT:-5176}"
LOG="/tmp/site00-builder-preview-server.log"
LINEAGE="/tmp/site00-builder-preview-runtime-lineage.txt"

cd "$ROOT"
SHA="$(git rev-parse HEAD)"
BRANCH="$(git branch --show-current 2>/dev/null || echo detached)"
{
  echo "BUILDER_PREVIEW_AUTHORITY=PR1672_WORKTREE"
  echo "BUILDER_BRANCH=$BRANCH"
  echo "BUILDER_SHA=$SHA"
  echo "BUILDER_WORKTREE=$ROOT"
  echo "BUILDER_PORT=$PORT"
} > "$LINEAGE"

echo "[$(date -u +%H:%M:%SZ)] Builder preview Vite on :$PORT SHA=$SHA" | tee -a "$LOG"
exec env SITE00_CLOUD_MOBILE_PREVIEW=1 SITE00_CLIENT_REVIEW_PREVIEW_MODE=1 \
  SITE00_INTAKES_USE_MEMORY=1 \
  VITE_SITE00_PREVIEW_LOCAL_API=1 \
  VITE_SITE00_TEMPLATE_SYSTEM_V1=1 \
  VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1=1 \
  VITE_SITE00_R4_REVIEW_PRIORITY=1 \
  npm run dev -- --port "$PORT" --host
