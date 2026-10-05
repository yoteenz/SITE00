#!/usr/bin/env bash
# Canonical unified review: Grok authority assets + Composer environment integration.
set -euo pipefail

SCRIPT_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORKTREE="$SCRIPT_REPO/.worktrees/grok-environment-unified-review"
BRANCH="cursor/grok-plus-environment-unified-review-87ed"

cd "$SCRIPT_REPO"
if [[ ! -d "$WORKTREE/.git" ]]; then
  git fetch origin "$BRANCH" 2>/dev/null || true
  if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    git worktree add "$WORKTREE" "$BRANCH"
  elif git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
    git worktree add "$WORKTREE" "origin/$BRANCH" -b "$BRANCH"
  else
    echo "Missing branch $BRANCH — create unified review branch first." >&2
    exit 1
  fi
fi

export SITE00_CLOUD_PREVIEW_ROOT="$WORKTREE"
export SITE00_CLOUD_PREVIEW_MODE="${SITE00_CLOUD_PREVIEW_MODE:-local}"
export SITE00_PREVIEW_SYNC_MAIN="${SITE00_PREVIEW_SYNC_MAIN:-0}"

exec bash "$SCRIPT_REPO/.cursor/scripts/run-site00-cloud-preview-server.sh"
