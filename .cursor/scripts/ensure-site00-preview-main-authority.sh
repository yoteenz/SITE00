#!/usr/bin/env bash
# Canonical cloud preview source: origin/preview/tunnel (fast-forwarded from main after every merge).
# Do NOT point the founder tunnel at cursor/grok-plus-environment-unified-review-87ed for workspace review.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WT="${SITE00_PREVIEW_MAIN_WORKTREE:-/tmp/site00-preview-main}"
LOG="/tmp/site00-preview-main-authority.log"
LINEAGE="/tmp/site00-preview-runtime-lineage.txt"
BRANCH="${SITE00_PREVIEW_BRANCH:-preview/tunnel}"
TRACK_REF="origin/$BRANCH"

rm -f /tmp/site00-cloud-preview-pinned-ref

cd "$ROOT"
git fetch origin main "$BRANCH" 2>>"$LOG" || git fetch origin main 2>>"$LOG" || true

if ! git show-ref --verify --quiet "refs/remotes/$TRACK_REF"; then
  TRACK_REF="origin/main"
  BRANCH="main"
fi

if [[ ! -e "$WT/.git" ]]; then
  git worktree add --detach "$WT" "$TRACK_REF" 2>>"$LOG"
else
  git -C "$WT" fetch origin "$BRANCH" main 2>>"$LOG" || true
  git -C "$WT" checkout --detach "$TRACK_REF" 2>>"$LOG"
fi

if [[ -d "$ROOT/node_modules" && ! -e "$WT/node_modules" ]]; then
  ln -sf "$ROOT/node_modules" "$WT/node_modules"
fi

SHA="$(git -C "$WT" rev-parse HEAD 2>/dev/null || echo unknown)"
{
  echo "PREVIEW_AUTHORITY=$TRACK_REF"
  echo "PREVIEW_BRANCH=$BRANCH"
  echo "PREVIEW_SHA=$SHA"
  echo "PREVIEW_WORKTREE=$WT"
  echo "PREVIEW_MODE=${SITE00_CLOUD_PREVIEW_MODE:-dev}"
  echo "UPDATED_UTC=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "NOTE=Founder tunnel tracks preview/tunnel (merged main). Feature branches invisible until merged."
} | tee "$LINEAGE" >>"$LOG"

echo "[$(date -u +%H:%M:%S)] preview tunnel authority OK: $TRACK_REF @ $SHA at $WT" >>"$LOG"
