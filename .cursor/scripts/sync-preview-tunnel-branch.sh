#!/usr/bin/env bash
# Keep origin/preview/tunnel aligned with origin/main so the founder tunnel shows merged agent work.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOG="/tmp/site00-preview-tunnel-sync.log"
REF="${SITE00_PREVIEW_GIT_REF:-preview/tunnel}"

cd "$ROOT"
git fetch origin main "$REF" 2>>"$LOG" || git fetch origin main 2>>"$LOG"

if ! git show-ref --verify --quiet "refs/remotes/origin/$REF"; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] origin/$REF missing — creating from origin/main" | tee -a "$LOG"
  git push origin "origin/main:refs/heads/$REF" 2>>"$LOG" || {
    git branch -f "$REF" origin/main
    git push -u origin "$REF" 2>>"$LOG"
  }
  exit 0
fi

MAIN_SHA="$(git rev-parse origin/main)"
TUNNEL_SHA="$(git rev-parse "origin/$REF" 2>/dev/null || echo none)"

if [[ "$MAIN_SHA" == "$TUNNEL_SHA" ]]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] preview/tunnel already at main ($MAIN_SHA)" >>"$LOG"
  exit 0
fi

if git merge-base --is-ancestor "origin/$REF" origin/main 2>/dev/null; then
  git push origin "origin/main:refs/heads/$REF" 2>>"$LOG"
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] fast-forwarded $REF to $MAIN_SHA" | tee -a "$LOG"
else
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WARN: origin/$REF diverged from main — reset $REF to main for founder preview" | tee -a "$LOG"
  git push origin "origin/main:refs/heads/$REF" --force-with-lease 2>>"$LOG"
fi
