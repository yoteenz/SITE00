#!/usr/bin/env bash
# Canonical cloud preview source: origin/main (unified production workspace + project-scoped tabs, PR #1404+).
# Do NOT point the founder tunnel at cursor/grok-plus-environment-unified-review-87ed for workspace review.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WT="${SITE00_PREVIEW_MAIN_WORKTREE:-/tmp/site00-preview-main}"
LOG="/tmp/site00-preview-main-authority.log"
LINEAGE="/tmp/site00-preview-runtime-lineage.txt"

rm -f /tmp/site00-cloud-preview-pinned-ref

cd "$ROOT"
git fetch origin main 2>>"$LOG" || true

if [[ ! -e "$WT/.git" ]]; then
  git worktree add --detach "$WT" origin/main 2>>"$LOG"
else
  git -C "$WT" fetch origin main 2>>"$LOG" || true
  git -C "$WT" checkout --detach origin/main 2>>"$LOG"
fi

if [[ -d "$ROOT/node_modules" && ! -e "$WT/node_modules" ]]; then
  ln -sf "$ROOT/node_modules" "$WT/node_modules"
fi

SHA="$(git -C "$WT" rev-parse HEAD 2>/dev/null || echo unknown)"
{
  echo "PREVIEW_AUTHORITY=origin/main"
  echo "PREVIEW_SHA=$SHA"
  echo "PREVIEW_WORKTREE=$WT"
  echo "PREVIEW_MODE=${SITE00_CLOUD_PREVIEW_MODE:-dev}"
  echo "UPDATED_UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "NOTE=Project-scoped production workspace (#1404+) lives on main, not grok unified-review."
} | tee "$LINEAGE" >>"$LOG"

echo "[$(date -u +%H:%M:%S)] preview main authority OK: $SHA at $WT" >>"$LOG"
